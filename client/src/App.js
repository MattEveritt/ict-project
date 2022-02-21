import React, { useState } from 'react'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import {
    IconButton,
    Button,
    CircularProgress,
    TextField,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import PhotoCameraRoundedIcon from '@material-ui/icons/PhotoCameraRounded'

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100%',
        textAlign: 'center',
        flexDirection: 'column',
    },
    imgBox: {
        maxWidth: '80%',
        maxHeight: '80%',
        margin: '10px',
    },
    img: {
        height: 'inherit',
        maxWidth: 'inherit',
    },
    input: {
        display: 'none',
    },
    button: {
        flex: 1,
        color: 'blue',
        fill: 'blue',
    },
}))

function App() {
    const classes = useStyles()
    const [source, setSource] = useState(false)
    const [image, setImage] = useState()
    const [isLoading, setIsLoading] = useState(false)
    const [isResultShowing, setIsResultShowing] = useState(false)
    const [registrationNumberInput, setRegistrationNumberInput] = useState('')

    const handleCapture = (target) => {
        if (target.files) {
            if (target.files.length !== 0) {
                const file = target.files[0]
                setImage(file)
                const newUrl = URL.createObjectURL(file)
                setSource(newUrl)
            }
        }
    }

    const handleOnChange = (e) => {
        setRegistrationNumberInput(e.target.value)
    }

    const sendImage = async () => {
        setIsLoading(true)
        setIsResultShowing(true)
        const formData = new FormData()
        formData.append('image', image)
        formData.append('registration', registrationNumberInput)
        fetch('http://localhost:5000/predict', {
            method: 'POST',
            body: formData,
        })
            .then((response) => {
                setIsLoading(false)
                const reader = response.body.getReader()
                return new ReadableStream({
                    start(controller) {
                        return pump()
                        function pump() {
                            return reader.read().then(({ done, value }) => {
                                // When no more data needs to be consumed, close the stream
                                if (done) {
                                    controller.close()
                                    return
                                }
                                // Enqueue the next data chunk into our target stream
                                controller.enqueue(value)
                                return pump()
                            })
                        }
                    },
                })
            })
            .then((stream) => new Response(stream))
            .then((response) => response.blob())
            .then((blob) => URL.createObjectURL(blob))
            .then((url) => setSource(url))
            .catch((err) => console.error(err))
    }

    return (
        <div className={classes.root}>
            <Grid container direction="column">
                <Grid
                    container
                    direction="column"
                    item
                    xs={12}
                    justifyContent="center"
                    alignItems="center"
                >
                    <h5>Capture your image</h5>
                    {source && (
                        <Box
                            display="flex"
                            justifyContent="center"
                            border={1}
                            className={classes.imgBox}
                        >
                            <img
                                src={source}
                                alt={'snap'}
                                className={classes.img}
                            ></img>
                        </Box>
                    )}
                    <input
                        accept="image/*"
                        className={classes.input}
                        id="icon-button-file"
                        type="file"
                        capture="environment"
                        onChange={(e) => handleCapture(e.target)}
                    />
                    <label htmlFor="icon-button-file">
                        <IconButton
                            color="primary"
                            aria-label="upload picture"
                            component="span"
                        >
                            <PhotoCameraRoundedIcon
                                fontSize="large"
                                color="primary"
                            />
                        </IconButton>
                    </label>
                    {isLoading && <CircularProgress />}
                    {!source & !isResultShowing ? null : (
                        <div>
                            <div style={{ margin: 30 }}>
                                <TextField
                                    placeholder="Vehicle registration"
                                    onChange={handleOnChange}
                                ></TextField>
                            </div>
                            <Button
                                onClick={sendImage}
                                style={{ flex: 1 }}
                                variant="contained"
                                color="primary"
                            >
                                <h5>Analyse image</h5>
                            </Button>
                        </div>
                    )}
                </Grid>
            </Grid>
        </div>
    )
}
export default App
