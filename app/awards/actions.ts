'use server';

interface CategoryData {
    id: string;
    title: string;
    nominees: string[];
    winner: string;
    voteCounts: Record<string, number>;
}

export async function getAwardsData(): Promise<CategoryData[]> {
    const SHEET_ID = '1d7BOE_DnTswMk1zw-4Jifv93XbEd42Kg6FWOounuvi0';
    const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

    try {
        const response = await fetch(CSV_URL, { cache: 'no-store' });
        const text = await response.text();

        // Parse CSV (simple parsing, assuming no commas in values or properly quoted)
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        if (lines.length < 2) return [];

        const headers = lines[0].split(',').map(h => h.trim());
        const dataRows = lines.slice(1).map(line => {
            // Handle potentially quoted values if necessary, but simple split for now
            // A robust regex split for CSV: 
            return line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
        });

        // Valid columns (skip Timestamp at index 0)
        // Map headers to categories
        const categories: CategoryData[] = headers.slice(1).map((title, index) => ({
            id: `cat-${index}`,
            title: title.replace(/^"|"$/g, ''), // Remove quotes if any
            nominees: [],
            winner: 'TBD',
            voteCounts: {}
        }));

        // Tally votes
        dataRows.forEach(row => {
            // Skip timestamp (idx 0), so colIndex 1 in headers maps to row[1]
            // Note: row array might include timestamp, so offset is needed?
            // Let's re-parse simply: line.split(',')
            // The regex above is tricky. Let's use simple split if complex parsing isn't needed or use a library if present.
            // Given constraint, I'll write a simple quote-aware parser.

            const rowValues = parseCSVRow(row.toString()); // Wait, dataRows is MatchArray[], let's re-do parsing in loop for safety.
        });

        // Actually, let's just do the parsing logic clean here.
        const parsedData = lines.slice(1).map(parseCSVRow);

        categories.forEach((cat, index) => {
            const colIndex = index + 1; // 0 is timestamp
            const votes: Record<string, number> = {};

            parsedData.forEach(row => {
                if (colIndex < row.length) {
                    let nominee = row[colIndex]?.trim();
                    // Clean up format (remove @ maybe? user used @handles)
                    if (nominee) {
                        nominee = nominee.replace(/^"|"$/g, ''); // Remove wrapping quotes
                        if (nominee) {
                            votes[nominee] = (votes[nominee] || 0) + 1;
                        }
                    }
                }
            });

            cat.voteCounts = votes;
            cat.nominees = Object.keys(votes);

            // Determine winner
            let maxVotes = 0;
            let winner = "No Votes Yet";
            Object.entries(votes).forEach(([nom, count]) => {
                if (count > maxVotes) {
                    maxVotes = count;
                    winner = nom;
                }
            });
            cat.winner = winner;
        });

        return categories;

    } catch (error) {
        console.error("Error fetching awards data:", error);
        return [];
    }
}

function parseCSVRow(row: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}
