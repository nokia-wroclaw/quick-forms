import React, {useEffect} from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

function RejectFormDialog(props) {
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        props.openRejectFormDialog()
    };

    const handleClose = () => {
        props.closeRejectFormDialog();
    };

    useEffect(() => {
        setOpen(props.open);
    })

    const handleReject = () => {
        props.handleReject()
    }

    return (
        <div>
            <Dialog open={props.rejectFormDialogOpen} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Reject form</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please inform user why his form was rejected
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="feedback"
                        type="text"
                        variant="outlined"
                        multiline
                        rows={3}
                        rowsMax={6}
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleClose} color="primary">
                        Send
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
export default RejectFormDialog