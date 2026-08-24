import {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";


function CameraCapture({

  sideLabel,

  onCapture,

  onClose

}) {

  const videoRef =
    useRef(null);

  const canvasRef =
    useRef(null);

  const streamRef =
    useRef(null);


  const [
    facingMode,
    setFacingMode
  ] =
    useState("environment");


  const [
    cameraLoading,
    setCameraLoading
  ] =
    useState(true);


  const [
    error,
    setError
  ] =
    useState("");


  const stopCamera =
    useCallback(() => {

      if (
        streamRef.current
      ) {

        streamRef.current
          .getTracks()
          .forEach(
            (track) =>
              track.stop()
          );

        streamRef.current =
          null;

      }


      if (
        videoRef.current
      ) {

        videoRef.current.srcObject =
          null;

      }

    }, []);


  useEffect(() => {

    let cancelled =
      false;


    const startCamera =
      async () => {

        try {

          stopCamera();

          setCameraLoading(true);

          setError("");


          const stream =
            await navigator
              .mediaDevices
              .getUserMedia({

                video: {

                  facingMode: {
                    ideal:
                      facingMode
                  },

                  width: {
                    ideal: 1920
                  },

                  height: {
                    ideal: 1080
                  }

                },

                audio: false

              });


          if (cancelled) {

            stream
              .getTracks()
              .forEach(
                (track) =>
                  track.stop()
              );

            return;

          }


          streamRef.current =
            stream;


          if (
            videoRef.current
          ) {

            videoRef.current.srcObject =
              stream;


            await videoRef.current.play();

          }


          if (!cancelled) {

            setCameraLoading(
              false
            );

          }

        } catch (err) {

          console.error(
            "CAMERA ERROR:",
            err
          );


          if (!cancelled) {

            let message =
              "Unable to access the camera.";


            if (
              err.name ===
                "NotAllowedError" ||
              err.name ===
                "PermissionDeniedError"
            ) {

              message =
                "Camera permission was denied. Please allow camera access.";

            }


            if (
              err.name ===
                "NotFoundError"
            ) {

              message =
                "No camera was found on this device.";

            }


            if (
              err.name ===
                "NotReadableError"
            ) {

              message =
                "The camera is currently being used by another application.";

            }


            setError(
              message
            );

            setCameraLoading(
              false
            );

          }

        }

      };


    startCamera();


    return () => {

      cancelled =
        true;

      stopCamera();

    };

  }, [
    facingMode,
    stopCamera
  ]);


  const handleCapture =
    useCallback(() => {

      const video =
        videoRef.current;

      const canvas =
        canvasRef.current;


      if (
        !video ||
        !canvas
      ) {
        return;
      }


      if (
        video.videoWidth === 0 ||
        video.videoHeight === 0
      ) {

        setError(
          "Camera is still loading. Please wait a moment."
        );

        return;

      }


      const context =
        canvas.getContext(
          "2d"
        );


      canvas.width =
        video.videoWidth;

      canvas.height =
        video.videoHeight;


      context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      );


      canvas.toBlob(

        (blob) => {

          if (!blob) {

            setError(
              "Failed to capture the card."
            );

            return;

          }


          const file =
            new File(

              [blob],

              `visiting-card-${Date.now()}.jpg`,

              {
                type:
                  "image/jpeg"
              }

            );


          stopCamera();

          onCapture(file);

        },

        "image/jpeg",

        0.92

      );

    }, [
      onCapture,
      stopCamera
    ]);


  const handleSwitchCamera =
    useCallback(() => {

      setFacingMode(
        (currentMode) =>
          currentMode ===
            "environment"
            ? "user"
            : "environment"
      );

    }, []);


  const handleClose =
    useCallback(() => {

      stopCamera();

      onClose();

    }, [
      onClose,
      stopCamera
    ]);


  return (

    <div className="camera-modal-overlay">

      <div className="camera-modal">


        <div className="camera-header">

          <div>

            <span className="camera-eyebrow">

              LIVE CAMERA

            </span>


            <h2>

              Capture {sideLabel}

            </h2>

          </div>


          <button
            className="icon-button"
            onClick={handleClose}
          >

            ✕

          </button>

        </div>


        <div className="camera-preview-container">


          {cameraLoading &&
            !error && (

              <div className="camera-loading">

                <div className="spinner" />

                <p>

                  Opening your camera...

                </p>

              </div>

            )}


          {error && (

            <div className="camera-error">

              <div className="error-icon">

                ⚠

              </div>


              <h3>

                Camera unavailable

              </h3>


              <p>

                {error}

              </p>


              <button
                className="camera-secondary-button"
                onClick={() => {

                  setError("");

                  setFacingMode(
                    (current) =>
                      current ===
                        "environment"
                        ? "user"
                        : "environment"
                  );

                }}
              >

                Try Again

              </button>

            </div>

          )}


          {!error && (

            <>

              <video
                ref={videoRef}
                className="camera-preview"
                autoPlay
                playsInline
                muted
              />


              <div className="scanner-overlay">

                <div className="scanner-top" />

                <div className="scanner-bottom" />


                <div className="scanner-frame">

                  <span className="corner top-left" />

                  <span className="corner top-right" />

                  <span className="corner bottom-left" />

                  <span className="corner bottom-right" />

                  <div className="scanner-line" />

                </div>

              </div>

            </>

          )}

        </div>


        <div className="camera-instructions">

          <span className="instruction-dot" />

          Keep the entire visiting card inside the frame

        </div>


        <canvas
          ref={canvasRef}
          style={{
            display: "none"
          }}
        />


        <div className="camera-controls">

          <button
            className="camera-secondary-button"
            onClick={handleClose}
          >

            Cancel

          </button>


          <button
            className="capture-button"
            onClick={handleCapture}
            disabled={
              cameraLoading ||
              Boolean(error)
            }
            title="Capture Card"
          >

            <span className="capture-button-inner" />

          </button>


          <button
            className="camera-secondary-button"
            onClick={
              handleSwitchCamera
            }
            disabled={
              cameraLoading ||
              Boolean(error)
            }
          >

            🔄 Switch

          </button>

        </div>

      </div>

    </div>

  );

}


export default CameraCapture;