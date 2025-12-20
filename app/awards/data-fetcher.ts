// Client-side data fetching

import { NOMINEE_IMAGES } from "./nominee-images";

const SHEET_ID = "1d7BOE_DnTswMk1zw-4Jifv93XbEd42Kg6FWOounuvi0";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

export interface Nominee {
    name: string;
    voteCount: number;
    image?: string;
}

export interface CategoryData {
    id: string;
    title: string;
    nominees: Nominee[]; // Changed from string[] to object array
    winner: Nominee | null;  // Changed from string to object
}

export async function getAwardsData(): Promise<CategoryData[]> {
    try {
        const response = await fetch(CSV_URL, { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch sheet");
        const csvText = await response.text();

        // 1. Parse CSV (skipping header row 1 which is "Timestamp")
        const rows = parseCSVRow(csvText);
        if (rows.length < 2) return [];

        const headers = rows[0]; // Category Titles are headers
        const dataRows = rows.slice(1);

        // Map to store votes: Category Index -> string (Nominee Name) -> count
        const voteMap = new Map<number, Map<string, number>>();

        // Initialize maps for each category (starting from index 1, skip Timestamp)
        for (let i = 1; i < headers.length; i++) {
            voteMap.set(i, new Map<string, number>());
        }

        // Tally votes
        dataRows.forEach(row => {
            row.forEach((vote, index) => {
                if (index === 0 || !vote) return; // Skip Timestamp and empty votes

                const categoryVotes = voteMap.get(index);
                if (categoryVotes) {
                    const currentCount = categoryVotes.get(vote) || 0;
                    categoryVotes.set(vote, currentCount + 1);
                }
            });
        });

        // Construct result
        const categories: CategoryData[] = [];

        voteMap.forEach((votes, index) => {
            const title = headers[index];
            const nominees: Nominee[] = [];
            let maxVotes = -1;
            let winner: Nominee | null = null;

            votes.forEach((count, name) => {
                const image = NOMINEE_IMAGES[name] || NOMINEE_IMAGES[name.trim()] || undefined;
                const nomineeObj: Nominee = { name, voteCount: count, image };
                nominees.push(nomineeObj);

                if (count > maxVotes) {
                    maxVotes = count;
                    winner = nomineeObj;
                }
            });

            // Sort nominees by votes descending (optional, looks better)
            nominees.sort((a, b) => b.voteCount - a.voteCount);

            categories.push({
                id: `cat-${index}`,
                title: title,
                nominees: nominees,
                winner: winner // Currently we show it client side, but we calculate it here
            });
        });

        return categories;

    } catch (error) {
        console.error("Error fetching awards:", error);
        return [];
    }
}


function parseCSVRow(text: string): string[][] {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = "";
    let insideQuotes = false;

    // Normalize newlines to \n
    const normalizedText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    for (let i = 0; i < normalizedText.length; i++) {
        const char = normalizedText[i];
        const nextChar = normalizedText[i + 1];

        if (char === '"') {
            if (insideQuotes && nextChar === '"') {
                currentCell += '"'; // Escaped quote
                i++; // Skip next quote
            } else {
                insideQuotes = !insideQuotes;
            }
        } else if (char === ',' && !insideQuotes) {
            currentRow.push(currentCell.trim());
            currentCell = "";
        } else if (char === '\n' && !insideQuotes) {
            currentRow.push(currentCell.trim());
            rows.push(currentRow);
            currentRow = [];
            currentCell = "";
        } else {
            currentCell += char;
        }
    }

    // Push last cell/row if exists
    if (currentCell || currentRow.length > 0) {
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
    }

    return rows;
}
