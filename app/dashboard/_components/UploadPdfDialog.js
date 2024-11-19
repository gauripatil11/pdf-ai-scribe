"use client"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { api } from "@/convex/_generated/api"
import { useUser } from "@clerk/nextjs"
import { DialogClose } from "@radix-ui/react-dialog"
import axios from "axios"
import { useAction, useMutation } from "convex/react"
import { Loader2Icon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import uuid4 from "uuid4"

function UploadPdfDialog({ children, isMaxFile }) {
    const generateUploadUrl = useMutation(api.fileStorage.generateUploadUrl);
    const AddFileEntry = useMutation(api.fileStorage.AddFileEntryToDb);
    const getFileUrl = useMutation(api.fileStorage.getFileUrl);
    const embeddDocument = useAction(api.myActions.ingest);
    const { user } = useUser();

    const [file, setFile] = useState();
    const [fileName, setFileName] = useState();
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const OnFileSelect = (e) => {
        setFile(e.target.files[0]);
    }

    const OnUpload = async () => {
        setLoading(true);

        try {
            // Step 1: Get a short-lived upload URL
            const postUrl = await generateUploadUrl();

            // Step 2: POST the file to the URL
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file?.type },
                body: file,
            });
            const { storageId } = await result.json();
            console.log("storageid", storageId);

            // Step 3: Save the newly allocated storage id to the database
            const fileId = uuid4();
            const fileUrl = await getFileUrl({ storageId });
            const response = await AddFileEntry({
                fileId: fileId,
                storageId: storageId,
                fileName: fileName ?? "Untitled file",
                fileUrl: fileUrl,
                createdBy: user?.primaryEmailAddress.emailAddress,
            });

            // API call to fetch PDF process data
            const apiResponse = await axios.get('/api/pdf-loader?pdfUrl=' + fileUrl);
            await embeddDocument({
                splitText: apiResponse.data.result,
                fileId: fileId,
            });

            toast("File is ready!");
        } catch (error) {
            console.error("File upload error:", error);
            toast.error("Failed to upload the file. Please try again.");
        } finally {
            setLoading(false);
            setOpen(false); // Close dialog after upload
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button onClick={() => setOpen(true)} disabled={isMaxFile} className="w-full">
                    + Upload PDF File
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Upload PDF File</DialogTitle>
                    <DialogDescription asChild>
                        <div>
                            <h2 className="mt-5">Select file to Upload</h2>
                            <div className="gap-2 p-3 rounded-md border">
                                <input type="file" accept="application/pdf" onChange={OnFileSelect} />
                            </div>
                            <div>
                                <label>File Name *</label>
                                <Input placeholder="File Name" onChange={(e) => setFileName(e.target.value)} />
                            </div>
                        </div>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-end">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                            Close
                        </Button>
                    </DialogClose>
                    <Button onClick={OnUpload} disabled={loading}>
                        {loading ? <Loader2Icon className="animate-spin" /> : "Upload"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default UploadPdfDialog;
