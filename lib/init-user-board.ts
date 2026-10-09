import connectDB from "./db";
import { Board, Column } from "./models";

const DEFAUL_COLUMNS = [
    { name: "Wish List", order: 0 },
    { name: "Applied", order: 1 },
    { name: "Interviewing", order: 2 },
    { name: "Offer", order: 3 },
    { name: "Rejected", order: 4 },
];

export async function initializeUserBoard(userId: string) {
    try {
        await connectDB();
        // Check if board already exists
        const existingBoard = await Board.findOne({ userId, name: "Job Hunt" });

        if (existingBoard) {
            return existingBoard;
        }

        const board = await Board.create({
            name: "Job Hunt",
            userId,
            column: [],
        });

        const columns = await Promise.all(
            DEFAUL_COLUMNS.map((column) =>
                Column.create({
                    name: column.name,
                    order: column.order,
                    boardId: board._id,
                    jobApplications: [],
                }),
            ),
        );
        // Update the board with now columns IDs
        board.columns = columns.map((col) => col._id);
        await board.save();
    } catch (err) {
        throw err;
    }
}
