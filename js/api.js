/**
 * Helper function to deep merge properties from source to target,
 * but only if the target's property is undefined, null, or an empty string.
 * This is crucial for the 'basedOn' templating system.
 * @param {object} target The object to merge into.
 * @param {object} source The object to merge from (defaults).
 * @returns {object} The modified target object.
 */
function mergeDefaults(target, source) {
    if (typeof target !== 'object' || target === null || typeof source !== 'object' || source === null) {
        return target; // Not objects, or null, so can't merge deeply
    }

    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            // Handle arrays (specifically chapters and specialFeatures arrays of objects)
            if (Array.isArray(source[key])) {
                if (!Array.isArray(target[key])) {
                    target[key] = []; // Ensure target has an array if source does
                }
                source[key].forEach((sourceItem, index) => {
                    if (typeof sourceItem === 'object' && sourceItem !== null) {
                        if (!target[key][index] || typeof target[key][index] !== 'object' || target[key][index] === null) {
                            // If target item is missing or not an object, deep copy the source item
                            target[key][index] = JSON.parse(JSON.stringify(sourceItem));
                        } else {
                            // If both are objects, recursively merge their properties
                            mergeDefaults(target[key][index], sourceItem);
                        }
                    } else {
                        // For primitive array items, only set if target's item is blank/missing
                        if (target[key][index] === undefined || target[key][index] === null || target[key][index] === '') {
                            target[key][index] = sourceItem;
                        }
                    }
                });
            }
            // Handle nested objects (if any besides arrays)
            else if (typeof source[key] === 'object' && source[key] !== null &&
                       typeof target[key] === 'object' && target[key] !== null) {
                mergeDefaults(target[key], source[key]); // Recursively merge for nested objects
            }
            // Handle primitive values (strings, numbers, booleans)
            else {
                // Only set if the target's value is undefined, null, or an empty string
                if (target[key] === undefined || target[key] === null || target[key] === '') {
                    target[key] = source[key];
                }
            }
        }
    }
    return target;
}


/**
 * Parses a CSV string into an array of JavaScript objects.
 * Each object represents a row, with headers as keys.
 * Handles nested array structures based on dot notation in headers (e.g., 'chapter1.title').
 * Assumes a 'rowId' column exists for lookup.
 * @param {string} csvString The raw CSV content.
 * @returns {Array<object>} An array of parsed data objects, one for each row.
 */
function parseCsv(csvString) {
    const lines = csvString.trim().split('\n');
    if (lines.length < 2) { // Need at least a header and one data row
        console.warn("CSV is empty or only contains headers.");
        return [];
    }

    const headers = lines[0].split(',').map(header => header.trim());
    // console.log("CSV Headers:", headers); // DEBUG: Log headers

    const parsedDataRows = [];

    // Start from the first data row (index 1)
    for (let i = 1; i < lines.length; i++) {
        const dataRowValues = lines[i].split(',').map(value => value.trim());
        const rowObject = {};
        // Initialize chapters and specialFeatures arrays to ensure they are always present
        rowObject.chapters = [];
        rowObject.specialFeatures = [];
        rowObject.pagination = [];

        headers.forEach((header, index) => {
            const value = dataRowValues[index];

            // Check for chapterX.property pattern
            const chapterMatch = header.match(/^chapter(\d+)\.(.+)$/);
            if (chapterMatch) {
                const chapterIndex = parseInt(chapterMatch[1], 10) - 1; // Convert to 0-based index
                const propName = chapterMatch[2];

                // Ensure the chapter object exists in the array
                if (!rowObject.chapters[chapterIndex]) {
                    rowObject.chapters[chapterIndex] = {};
                }
                rowObject.chapters[chapterIndex][propName] = value;
                return; // Move to next header
            }

            // Check for specialFeatureX.property pattern
            const featureMatch = header.match(/^specialFeature(\d+)\.(.+)$/);
            if (featureMatch) {
                const featureIndex = parseInt(featureMatch[1], 10) - 1; // Convert to 0-based index
                const propName = featureMatch[2];

                // Ensure the special feature object exists in the array
                if (!rowObject.specialFeatures[featureIndex]) {
                    rowObject.specialFeatures[featureIndex] = {};
                }
                rowObject.specialFeatures[featureIndex][propName] = value;
                return; // Move to next header
            }

            // Check for paginationX.property pattern
            const paginationMatch = header.match(/^pagination(\d+)\.(.+)$/);
            if (paginationMatch) {
                const pageIndex = parseInt(paginationMatch[1], 10) - 1; // 0-based index
                const propName = paginationMatch[2];

                // Ensure the pagination object exists in the array
                if (!rowObject.pagination[pageIndex]) {
                    rowObject.pagination[pageIndex] = {};
                }
                rowObject.pagination[pageIndex][propName] = value;
                return; // Move to next header
            }

            // For all other (flat) properties, including 'rowId' and 'basedOn'
            rowObject[header] = value;
        });

        // console.log(`Parsed Row ${i}:`, rowObject); // DEBUG: Log each parsed row object

        parsedDataRows.push(rowObject);
    }

    return parsedDataRows; // Returns an array of all data rows
}


/**
 * Asynchronously fetches data from a Google Sheet CSV and selects a specific row by ID,
 * applying 'basedOn' inheritance.
 * @param {string} requestedId The ID of the site version to fetch.
 * @returns {Promise<object|null>} A promise that resolves with the fetched and selected data, or null on error.
 */
export async function fetchData(requestedId) {
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRnDZiD0zbEjdALbE4BPJrGUvnC3jK4mK4uebn2kLjajcgCbXQsE5xBG9a0R1wxn9WJo-ogpLC3p-X0/pub?gid=1534684239&single=true&output=csv';
    let retries = 3;
    let delay = 1000; // 1 second    

    while (retries > 0) {
        try {
            const response = await fetch(csvUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvText = await response.text();

            const allParsedRows = parseCsv(csvText);
            console.log("API: All Parsed CSV Rows (before resolution):", JSON.parse(JSON.stringify(allParsedRows)));

            const rowIdMap = new Map();
            allParsedRows.forEach(row => {
                if (row.rowId) {
                    rowIdMap.set(row.rowId, row);
                }
            });

            const resolvedRows = structuredClone(allParsedRows);
            const maxResolutionPasses = 5;
            for (let pass = 0; pass < maxResolutionPasses; pass++) {
                let changesMadeInPass = false;
                resolvedRows.forEach(targetRow => {
                    const baseId = targetRow.basedOn;
                    if (baseId && rowIdMap.has(baseId)) {
                        const baseRowOriginal = rowIdMap.get(baseId);
                        const baseToMerge = structuredClone(baseRowOriginal);
                        const originalTargetRow = structuredClone(targetRow);
                        mergeDefaults(targetRow, baseToMerge);
                        if (JSON.stringify(originalTargetRow) !== JSON.stringify(targetRow)) {
                            changesMadeInPass = true;
                        }
                    }
                });
                if (!changesMadeInPass && pass > 0) {
                    console.log(`API: 'basedOn' resolution complete after ${pass} passes.`);
                    break;
                }
            }
            console.log("API: All Parsed CSV Rows (after 'basedOn' resolution):", JSON.parse(JSON.stringify(resolvedRows)));

            let selectedData = resolvedRows.find(row => row.rowId === requestedId);
            if (!selectedData) {
                selectedData = resolvedRows.find(row => row.rowId === '1');
            }
            if (!selectedData && resolvedRows.length > 0) {
                console.warn(`Requested ID '${requestedId}' not found, and '1' not found. Defaulting to first available resolved row in CSV.`);
                selectedData = resolvedRows[0];
            }

            console.log("API: Selected data row for use (before final merge):", structuredClone(selectedData));
            return selectedData;
        } catch (error) {
            console.error(`Error fetching data: ${error.message}. Retrying in ${delay / 1000}s...`);
            retries--;
            if (retries > 0) {
                await new Promise(res => setTimeout(res, delay));
                delay *= 2;
            }
        }
    }
    console.error("Failed to fetch data after multiple retries.");
    return null;
}

export { mergeDefaults };