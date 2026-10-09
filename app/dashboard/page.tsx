import KabanBoard from "@/components/kaban-board";
import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import { Board } from "@/lib/models";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function getBoard(userId: string) {
    "use cache";
    await connectDB();
    const board = await Board.findOne({
        userId,
        name: "Job Hunt",
    })
        .populate({
            path: "columns",
            populate: {
                path: "jobApplications",
            },
        })
        .lean();
    return JSON.parse(JSON.stringify(board));
}

async function DashboardPage() {
    const session = await getSession();
    if (!session?.user) {
        redirect("/sign-in");
    }
    const board = await getBoard(session?.user.id ?? "");

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-black">
                        {board.name}
                    </h1>
                    <p className="text-gray-600">Track your job application</p>
                </div>

                <KabanBoard
                    board={JSON.parse(JSON.stringify(board))}
                    userId={session.user.id}
                />
            </div>
        </div>
    );
}

export default async function Dashboard() {
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <DashboardPage />
        </Suspense>
    );
}
