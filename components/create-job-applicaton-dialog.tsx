"use client";

import { Plus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { useState } from "react";
import { createJobApplication } from "@/lib/actions/job-application";

interface CreateJobApplicationDialogProps {
    columnId: string;
    boardId: string;
}

export default function CreateJobApplicatonDialog({
    columnId,
    boardId,
}: CreateJobApplicationDialogProps) {
    const INITIAL_FORM_DATA = {
        company: "",
        position: "",
        location: "",
        notes: "",
        salary: "",
        jobUrl: "",
        tags: "",
        description: "",
    };

    const [open, setOpen] = useState<boolean>(false);
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            const result = await createJobApplication({
                ...formData,
                columnId,
                boardId,
                tags: formData.tags
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter((tag) => tag.length > 0),
            });
            if (!result.error) {
                setFormData(INITIAL_FORM_DATA);
                setOpen(false);
            } else {
                console.error("Failed to create job: ", result.error);
            }
        } catch (err) {
            console.error(err);
        }
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="flex gap-2 text-black px-2 py-1 items-center border rounded-lg text-xm">
                <Plus size={16} /> Add Job
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Add Job Application</DialogTitle>
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
                            <Label htmlFor="tags">Tags (comma-separated)</Label>
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
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">Add Application</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
