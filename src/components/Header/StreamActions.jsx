import { Fragment, useEffect, useState } from "react";
import { useMedia } from "react-use";
import {
  selectAppData,
  selectIsConnectedToRoom,
  selectPermissions,
  useHMSActions,
  useHMSStore,
  useRecordingStreaming,
} from "@100mslive/react-sdk";
import { RecordIcon, WrenchIcon } from "@100mslive/react-icons";
import {
  Box,
  Button,
  config as cssConfig,
  Flex,
  Loading,
  Popover,
  Text,
  Tooltip,
} from "@100mslive/react-ui";
import GoLiveButton from "../GoLiveButton";
import { ResolutionInput } from "../Streaming/ResolutionInput";
import { getResolution } from "../Streaming/RTMPStreaming";
import { ToastManager } from "../Toast/ToastManager";
import { AdditionalRoomState, getRecordingText } from "./AdditionalRoomState";
import { useSidepaneState, useSidepaneToggle } from "../AppData/useSidepane";
import { useSetAppDataByKey } from "../AppData/useUISettings";
import {
  APP_DATA,
  RTMP_RECORD_DEFAULT_RESOLUTION,
  SIDE_PANE_OPTIONS,
} from "../../common/constants";


export const LiveStatus = () => {
  const { isHLSRunning, isRTMPRunning } = useRecordingStreaming();
  if (!isHLSRunning && !isRTMPRunning) {
    return null;
  }
  return (
    <Flex align="center">
      <Box css={{ w: "$4", h: "$4", r: "$round", bg: "$error", mr: "$2" }} />
      <Text>
        Live
        <Text as="span" css={{ "@md": { display: "none" } }}>
          &nbsp;with {isHLSRunning ? "HLS" : "RTMP"}
        </Text>
      </Text>
    </Flex>
  );
};

export const RecordingStatus = () => {
  const {
    isBrowserRecordingOn,
    isServerRecordingOn,
    isHLSRecordingOn,
    isRecordingOn,
  } = useRecordingStreaming();
  const permissions = useHMSStore(selectPermissions);

  if (
    !isRecordingOn ||
    // if only browser recording is enabled, stop recording is shown
    // so no need to show this as it duplicates
    [
      permissions?.browserRecording,
      !isServerRecordingOn,
      !isHLSRecordingOn,
      isBrowserRecordingOn,
    ].every(value => !!value)
  ) {
    return null;
  }
  return (
    <Tooltip
      title={getRecordingText({
        isBrowserRecordingOn,
        isServerRecordingOn,
        isHLSRecordingOn,
      })}
    >
      <Box
        css={{
          color: "$error",
        }}
      >
        <RecordIcon width={24} height={24} />
      </Box>
    </Tooltip>
  );
};

const EndStream = () => {
  const toggleStreaming = useSidepaneToggle(SIDE_PANE_OPTIONS.STREAMING);
  const sidePane = useSidepaneState();
  useEffect(() => {
    if (window && !sidePane) {
      const userStartedStream =
        window.sessionStorage.getItem("userStartedStream");
      if (userStartedStream === "true") {
        toggleStreaming();
        window.sessionStorage.setItem("userStartedStream", "");
      }
    }
  }, [sidePane, toggleStreaming]);

  return (
    <Button
      data-testid="end_stream"
      variant="danger"
      icon
      onClick={toggleStreaming}
    >
      <WrenchIcon />
      Manage Stream
    </Button>
  );
};

const StartRecording = () => {
  const permissions = useHMSStore(selectPermissions);
  const recordingUrl = useHMSStore(selectAppData(APP_DATA.recordingUrl));
  const [resolution, setResolution] = useState(RTMP_RECORD_DEFAULT_RESOLUTION);
  const [open, setOpen] = useState(false);
  const [recordingStarted, setRecordingState] = useSetAppDataByKey(
    APP_DATA.recordingStarted
  );
  const { isBrowserRecordingOn, isStreamingOn, isHLSRunning } =
    useRecordingStreaming();
  const hmsActions = useHMSActions();
  if (!permissions?.browserRecording || isHLSRunning) {
    return null;
  }
  if (isBrowserRecordingOn) {
    return (
      <Popover.Root open={open} onOpenChange={setOpen}>
        
      </Popover.Root>
    );
  }
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
     
    </Popover.Root>
  );
};

export const StreamActions = () => {
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const permissions = useHMSStore(selectPermissions);
  const isMobile = useMedia(cssConfig.media.md);
  const { isStreamingOn } = useRecordingStreaming();

  return (
    <Flex align="center" css={{ gap: "$4" }}>
      <AdditionalRoomState />
      <Flex align="center" css={{ gap: "$4", "@md": { display: "none" } }}>
        <LiveStatus />
        <RecordingStatus />
      </Flex>
      {isConnected && !isMobile ? <StartRecording /> : null}
      {isConnected &&
        (permissions.hlsStreaming || permissions.rtmpStreaming) && (
          <Fragment>
            {isStreamingOn ? <EndStream /> : <GoLiveButton />}
          </Fragment>
        )}
    </Flex>
  );
};
