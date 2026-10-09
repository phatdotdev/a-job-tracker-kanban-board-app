"use client";

import { Board, Column, JobApplication } from "@/lib/models/models.types";
import {
    Award,
    Calendar,
    CheckCircle2,
    Mic,
    MoreVertical,
    Trash2,
    XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import CreateJobApplicatonDialog from "./create-job-applicaton-dialog";
import JobApplicationCard from "./job-application-card";
import { useBoard } from "@/lib/hooks/useBoard";
import {
    closestCorners,
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useDroppable,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

interface KabanBoardProps {
    board: Board;
    userId: string;
}

interface ColConfig {
    color: string;
    icon: React.ReactNode;
}

const COLUMN_CONFIG: Array<ColConfig> = [
    { color: "bg-cyan-500", icon: <Calendar className="h-4 w-4" /> },
    { color: "bg-purple-500", icon: <CheckCircle2 className="h-4 w-4" /> },
    {
        color: "bg-green-500",
        icon: <Mic className="h-4 w-4" />,
    },
    { color: "bg-yellow-500", icon: <Award className="h-4 w-4" /> },
    { color: "bg-red-500", icon: <XCircle className="h-4 w-4" /> },
];

function SortableJobCard({
    job,
    columns,
}: {
    job: JobApplication;
    columns: Column[];
}) {
    const {
        attributes,
        listeners,
        transform,
        transition,
        setNodeRef,
        isDragging,
    } = useSortable({
        id: job._id,
        data: {
            type: "job",
            job,
        },
    });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };
    return (
        <div ref={setNodeRef} style={style}>
            <JobApplicationCard
                job={job}
                columns={columns}
                dragHandleProps={{ ...attributes, ...listeners }}
            />
        </div>
    );
}

function DroppableColumn({
    column,
    config,
    boardId,
    sortedColumns,
}: {
    column: Column;
    config: ColConfig;
    boardId: string;
    sortedColumns: Column[];
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: column._id,
        data: {
            type: "column",
            columnId: column._id,
        },
    });
    const sortedJobs = column.jobApplications
        ? [...column.jobApplications?.sort((a, b) => a.order - b.order)]
        : [];

    return (
        <Card className="min-w-[300px] flex-shrink-0 shadow-md p-0">
            <CardHeader
                className={`${config.color} text-white rounded-t-lg py-0 px-0`}
            >
                <div className="flex items-center justify-between px-4 py-2">
                    <div className="flex items-center justify-between gap-2">
                        <div>{config.icon}</div>
                        <CardTitle>{column.name}</CardTitle>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            align="end"
                            className="w-fit min-w-0 w-9"
                        >
                            <DropdownMenuItem>
                                <Trash2 className="mr-2 h-4 w-4" />
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <CardContent
                    ref={setNodeRef}
                    className={`py-2 space-y-2 pt-4 bg-gray-50/50 min-h-[400px] rounded-b-lg bg-white ${isOver ? "ring-blue-500" : ""}`}
                >
                    <SortableContext
                        items={sortedJobs.map((job) => job._id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {sortedJobs.map((job, key) => (
                            <SortableJobCard
                                key={key}
                                job={{
                                    ...job,
                                    columnId: job.columnId || column._id,
                                }}
                                columns={sortedColumns}
                            />
                        ))}
                    </SortableContext>
                    <CreateJobApplicatonDialog
                        columnId={column._id}
                        boardId={boardId}
                    />
                </CardContent>
            </CardHeader>
        </Card>
    );
}

export default function KabanBoard({ board, userId }: KabanBoardProps) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const { columns, moveJob } = useBoard(board);
    const sortedColumns = columns
        ? columns?.sort((a, b) => a.order - b.order)
        : [];

    async function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id as string);
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveId(null);

        if (!over || !board._id) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // 1. Tìm thông tin công việc được kéo
        let draggedJob: JobApplication | null = null;
        let sourceColumn: Column | null = null;
        let sourceIndex = -1;

        for (const col of sortedColumns) {
            const jobs = [...(col.jobApplications || [])].sort(
                (a, b) => a.order - b.order,
            );
            const idx = jobs.findIndex((j) => j._id === activeId);
            if (idx !== -1) {
                draggedJob = jobs[idx];
                sourceColumn = col;
                sourceIndex = idx;
                break;
            }
        }

        if (!draggedJob || !sourceColumn) return;

        // 2. Xác định đích đến (Thả vào Cột hay thả lên 1 Card khác)
        let targetColumnId: string = "";
        let targetIndex: number = -1;

        const targetColumn = sortedColumns.find((col) => col._id === overId);
        const targetJob = sortedColumns
            .flatMap((col) => col.jobApplications || [])
            .find((j) => j._id === overId);

        if (targetColumn) {
            // Thả vào khoảng trống của cột
            targetColumnId = targetColumn._id;
            const targetJobs = targetColumn.jobApplications || [];
            targetIndex = targetJobs.length;
        } else if (targetJob) {
            // Thả đè lên 1 Job khác
            const targetColObj = sortedColumns.find((col) =>
                col.jobApplications?.some((j) => j._id === targetJob._id),
            );
            if (!targetColObj) return;

            targetColumnId = targetColObj._id;
            const targetJobs = [...(targetColObj.jobApplications || [])].sort(
                (a, b) => a.order - b.order,
            );

            // ✅ FIX: Tính toán chỉ số chính xác trong danh sách công việc lọc
            const overIndex = targetJobs.findIndex((j) => j._id === overId);
            if (sourceColumn._id === targetColumnId) {
                targetIndex = sourceIndex < overIndex ? overIndex : overIndex;
            } else {
                targetIndex = overIndex;
            }
        }

        // ✅ FIX: Sửa lỗi gõ sai chữ hoa targetColumnId
        if (!targetColumnId || targetIndex < 0) return;

        // Gọi API cập nhật dữ liệu
        await moveJob(activeId, targetColumnId, targetIndex);
    }

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
    );

    const activeJob = sortedColumns
        .flatMap((col) => col.jobApplications || [])
        .find((job) => job._id === activeId);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="space-4">
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {columns.map((col, key) => {
                        const config = COLUMN_CONFIG[key] || {
                            color: "bg-gray-500",
                            icon: <Calendar className="h-4 w-4" />,
                        };
                        return (
                            <DroppableColumn
                                key={key}
                                column={col}
                                config={config}
                                boardId={board._id}
                                sortedColumns={sortedColumns}
                            />
                        );
                    })}
                </div>
            </div>

            <DragOverlay>
                {activeJob ? (
                    <div className="opacity-50">
                        <JobApplicationCard
                            job={activeJob}
                            columns={sortedColumns}
                        />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
