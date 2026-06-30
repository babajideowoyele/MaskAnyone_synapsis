import {Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Menu, MenuItem, Typography} from "@mui/material";
import {useState} from "react";
import {useSelector} from "react-redux";
import Selector from "../../../state/selector";
import Config from "../../../config";
import KeycloakAuth from "../../../keycloakAuth";

interface DownloadMenuProps {
    videoId: string;
    resultVideoId?: string;
    anchorEl: HTMLElement|null;
    onClose: () => void;
}

const DownloadMenu = (props: DownloadMenuProps) => {
    const downloadableResultFileLists = useSelector(Selector.Video.downloadableResultFileLists);
    const [reviewDialogOpen, setReviewDialogOpen] = useState<boolean>(false);

    const downloadableResultFiles = downloadableResultFileLists[props.resultVideoId || ''] || [];
    const open = Boolean(props.anchorEl);

    const downloadOriginalVideo = () => {
        window.open(`/api/videos/${props.videoId}/download?token=${KeycloakAuth.getToken()}`, '_blank');
        props.onClose();
    };

    const confirmAndDownloadResult = () => {
        window.open(`/api/videos/${props.videoId}/results/${props.resultVideoId}/download?token=${KeycloakAuth.getToken()}`, '_blank');
        setReviewDialogOpen(false);
        props.onClose();
    };

    return (
        <>
            <Menu
                anchorEl={props.anchorEl}
                open={open}
                onClose={props.onClose}
            >
                <MenuItem onClick={downloadOriginalVideo}>Original Video</MenuItem>
                {props.resultVideoId && (
                    <MenuItem onClick={() => { props.onClose(); setReviewDialogOpen(true); }}>
                        Result Video
                    </MenuItem>
                )}
                {downloadableResultFiles.map((file) => (
                    <MenuItem
                        key={file.id}
                        onClick={() => {
                            window.open(Config.api.baseUrl + file.url + `?token=${KeycloakAuth.getToken()}`, '_blank');
                            props.onClose();
                        }}
                        children={file.title}
                    />
                ))}
            </Menu>

            <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Review before downloading</DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        MaskAnyone may have missed faces or body parts. You are responsible for checking the result before using it in research or sharing it.
                    </Alert>
                    <Typography variant="body2" gutterBottom>
                        Before downloading, please check for:
                    </Typography>
                    <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
                        <li>Frames where people turn away from the camera or are partially occluded</li>
                        <li>People who appear briefly, at the edges, or in the background</li>
                        <li>Unusual clothing or accessories that may have confused detection</li>
                        <li>Audio — voice anonymization is separate and may not have been applied</li>
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                        Questions? Contact CLS: <a href="mailto:babajide.owoyele@ru.nl">babajide.owoyele@ru.nl</a> or <a href="mailto:h.vanden.heuvel@ru.nl">h.vanden.heuvel@ru.nl</a>
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setReviewDialogOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={confirmAndDownloadResult} variant="contained">
                        I've reviewed it — download
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default DownloadMenu;
