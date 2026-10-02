import type { SyntheticEvent } from "react";
import { set, useProjectId, useDataset, type ObjectInputProps } from "sanity";
import { videoFileUrl } from "./videoFiles";

type VideoValue = {
  file?: { asset?: { _ref?: string } };
  width?: number;
  height?: number;
};

export function VideoInput(props: ObjectInputProps<VideoValue>) {
  const projectId = useProjectId();
  const dataset = useDataset();
  const ref = props.value?.file?.asset?._ref;

  function syncSize(event: SyntheticEvent<HTMLVideoElement>) {
    const { videoWidth, videoHeight } = event.currentTarget;
    if (!videoWidth) return;
    if (props.value?.width === videoWidth && props.value?.height === videoHeight) return;
    props.onChange([set(videoWidth, ["width"]), set(videoHeight, ["height"])]);
  }

  return (
    <>
      {props.renderDefault(props)}
      {ref && (
        <video
          key={ref}
          src={videoFileUrl(ref, projectId, dataset)}
          preload="metadata"
          muted
          hidden
          onLoadedMetadata={syncSize}
        />
      )}
    </>
  );
}
