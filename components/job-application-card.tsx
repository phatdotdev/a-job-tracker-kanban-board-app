import { Column, JobApplication } from "@/lib/models/models.types";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Edit2, ExternalLink, MoreVertical, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
    deleteJobApplication,
    updateJobApplication,
} from "@/lib/actions/job-application";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface JobApplicationCardProps {
    job: JobApplication;
    columns: Column[];
    dragHandleProps?: any;
}

export default function JobApplicationCard({
    job,
    columns,
    dragHandleProps,
}: JobApplicationCardProps) {
    async function handleMove(newColumnId: string) {
        try {
            const result = await updateJobApplication(job._id, {
                columnId: newColumnId,
            });
        } catch (error) {
            console.error("Faild to move job application: ", error);
        }
    }

    const INITIAL_FORM_DATA = {
        company: job.company,
        position: job.position,
        location: job.location,
        notes: job.notes,
        salary: job.salary,
        jobUrl: job.jobUrl,
        tags: Array.isArray(job.tags) ? job.tags.join(", ") : "",
        description: job.description,
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            const result = await updateJobApplication(job._id, {
                ...formData,
                tags: formData.tags
                    .split(", ")
                    .map((tag) => tag.trim())
                    .filter((tag) => tag.length > 0),
            });
            if (!result.error) {
                setEditing(false);
            }
        } catch (error) {
            console.error("Failed to save job application: ", error);
        }
    }
    const router = useRouter();
    async function handleDelete(id: string) {
        try {
            const result = await deleteJobApplication(id);
            if (result.error) {
                console.error(
                    "Failed to delete job application:",
                    result.error,
                );
            }
            router.refresh();
        } catch (error) {
            console.error("Failed to delete job application: ", error);
        }
    }

    const [editing, setEditing] = useState<boolean>(false);
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    return (
        <>
            <Card {...dragHandleProps}>
                <CardContent className="px-4">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm mb-1">
                                {job.position}
                            </h3>
                            <p className="text-xs text-muted-foreground mb-2">
                                {job.company}
                            </p>
                            {job.description && (
                                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                    {job.description}
                                </p>
                            )}
                            {job.tags && job.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {job.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {job.jobUrl && (
                                <a
                                    href={job.jobUrl}
                                    target="_blank"
                                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                        </div>
                        <div className="flex items-start gap-1">
                            <DropdownMenu>
                                <DropdownMenuTrigger>
                                    <MoreVertical className="h-4 w-4" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="min-w-40"
                                >
                                    <DropdownMenuItem>
                                        <Button
                                            className="w-full flex justify-start p-0 m-0"
                                            variant="ghost"
                                            onClick={() => setEditing(true)}
                                        >
                                            <Edit2 className="mr-2 h-4 w-4" />
                                            Edit
                                        </Button>
                                    </DropdownMenuItem>
                                    {columns.length > 1 && (
                                        <>
                                            {columns
                                                .filter(
                                                    (c) =>
                                                        c._id !== job.columnId,
                                                )
                                                .map((column, key) => (
                                                    <DropdownMenuItem
                                                        key={key}
                                                        onClick={() =>
                                                            handleMove(
                                                                column._id,
                                                            )
                                                        }
                                                    >
                                                        Move to {column.name}
                                                    </DropdownMenuItem>
                                                ))}
                                        </>
                                    )}
                                    <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={async () =>
                                            await handleDelete(job._id)
                                        }
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={editing} onOpenChange={setEditing}>
                <DialogContent>
                    <DialogTitle>Update Job Application</DialogTitle>
                    <DialogDescription>
                        Track a new job application
                    </DialogDescription>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="company">Company *</Label>
                                    <Input
                                        id="company"
                                        required
                                        value={formData.company}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                company: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="position">Position *</Label>
                                    <Input
                                        id="position"
                                        required
                                        value={formData.position}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                position: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="location">Location </Label>
                                    <Input
                                        id="location"
                                        value={formData.location}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                location: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="salary">Salary</Label>
                                    <Input
                                        id="salary"
                                        placeholder="e.g. $100K - $1500k"
                                        value={formData.salary}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                salary: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="jobUrl">Job Url</Label>
                                <Input
                                    id="jobUrl"
                                    placeholder="https://..."
                                    value={formData.jobUrl}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            jobUrl: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tags">
                                    Tags (comma-separated)
                                </Label>
                                <Input
                                    id="tags"
                                    placeholder="React, Tailwind, High Pay"
                                    value={formData.tags}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            tags: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    rows={3}
                                    className="w-full"
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            description: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Input
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            notes: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditing(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">Update Application</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
