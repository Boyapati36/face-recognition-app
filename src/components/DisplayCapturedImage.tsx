import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/Store';
import { Grid, Card, CardContent, Typography, Box, IconButton, Button } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { clearCapturedImage } from '../redux/CameraSlice';
import { loadImages } from '../service/TrainModel';
import { setLabeledDescriptors } from '../redux/FaceRecognitionSlice';
import * as faceapi from 'face-api.js';
import LoadingOverlay from '../util/LoadingOverlay';

const DisplayCapturedImages: React.FC = () => {
    const capturedImages = useSelector((state: RootState) => state.camera);
    const capturedImage = useSelector((state: RootState) => state.camera.at(state.camera.length - 1));
    const noOfImagesCaptured = useSelector((state: RootState) => state.camera.length);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState<boolean>(false);

    const trainModel = async () => {
        setLoading(true);
        try {
            const descriptors = await loadImages(capturedImages);
            const validDescriptors = descriptors.map(descriptor => descriptor || new faceapi.LabeledFaceDescriptors('', []));
            dispatch(setLabeledDescriptors(validDescriptors));
        } catch (error) {
            console.error('Error training model:', error);
        }
        finally{
            setLoading(false)
        }
    }

    return (
        <Box className="d-flex flex-column h-100">
            <Grid container className="flex-grow-1">
                <Grid item xs={12} md={12}>
                    <Card className="border border-2 rounded-2 shadow-sm h-100">
                        <CardContent className='h-100'>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            Captured Image
                        </Typography>
                        </CardContent>
                        <Grid item className='h-100'>
                            <Card>
                                <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Total Captures
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {noOfImagesCaptured} images
                                </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Card>
                    <Card className="border border-2 rounded-2 shadow-sm h-100">
                        <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Latest Capture
                        </Typography>
                        {capturedImage?.capturedImage ? (
                            <Box>
                                <img
                                    src={capturedImage.capturedImage}
                                    alt="Latest Captured Image"
                                    style={{ maxWidth: '81%', maxHeight: '70%', objectFit: 'cover' }}
                                />
                                <IconButton size="small" color="error" aria-label="delete" onClick={() => dispatch(clearCapturedImage())}>
                                    <Delete />
                                </IconButton>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    size="large"
                                    className="mt-2 mb-2 px-5 py-2 font-weight-bold text-transform-none shadow-sm rounded-4"
                                    onClick={trainModel}
                                    >
                                    Train Model
                                </Button>
                            </Box>
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                            No images captured yet.
                            </Typography>
                        )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            <LoadingOverlay isOpen={loading}/>
        </Box>
    );
};

export default DisplayCapturedImages;
