import { useRef, useState, type ChangeEvent } from "react";
import { insert, setIfMissing, useClient, type ArrayOfObjectsInputProps } from "sanity";
import { Button, Card, Flex, Stack, Text } from "@sanity/ui";
import { UploadIcon } from "@sanity/icons/Upload";
import { readVideoSize } from "./videoFiles";

const batchSize = 5;

type Progress = { done: number; total: number } | null;

function uniqueKey() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

function chunk<T>(items: T[], size: number) {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, index * size + size),
  );
}

function isVideo(file: File) {
  return file.type.startsWith("video/");
}

export function BatchMediaUploadInput(props: ArrayOfObjectsInputProps) {
  const { onChange, readOnly } = props;
  const client = useClient({ apiVersion: "2025-02-19" });
  const fileInput = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<Progress>(null);
  const [failed, setFailed] = useState<string[]>([]);

  async function uploadOne(file: File) {
    if (!isVideo(file)) {
      const asset = await client.assets.upload("image", file, { filename: file.name });
      return {
        _type: "image",
        _key: uniqueKey(),
        asset: { _type: "reference", _ref: asset._id },
      };
    }

    const [size, asset] = await Promise.all([
      readVideoSize(file),
      client.assets.upload("file", file, { filename: file.name }),
    ]);
    return {
      _type: "video",
      _key: uniqueKey(),
      file: { _type: "file", asset: { _type: "reference", _ref: asset._id } },
      ...size,
    };
  }

  async function uploadFiles(files: File[]) {
    setFailed([]);
    setProgress({ done: 0, total: files.length });
    onChange(setIfMissing([]));

    for (const batch of chunk(files, batchSize)) {
      const results = await Promise.allSettled(batch.map(uploadOne));

      const items = results.flatMap((result) =>
        result.status === "fulfilled" ? [result.value] : [],
      );
      const failedNames = results.flatMap((result, index) =>
        result.status === "rejected" ? [batch[index].name] : [],
      );

      if (items.length) onChange(insert(items, "after", [-1]));
      if (failedNames.length) setFailed((current) => [...current, ...failedNames]);
      setProgress((current) => current && { ...current, done: current.done + batch.length });
    }

    setProgress(null);
  }

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []).filter(
      (file) => file.type.startsWith("image/") || isVideo(file),
    );
    event.currentTarget.value = "";
    if (files.length) uploadFiles(files);
  }

  const isUploading = progress !== null;

  return (
    <Stack gap={3}>
      {props.renderDefault(props)}
      <input
        ref={fileInput}
        type="file"
        accept="image/*,video/mp4,video/webm,video/quicktime"
        multiple
        hidden
        onChange={handleFiles}
      />
      <Flex>
        <Button
          icon={UploadIcon}
          mode="ghost"
          text={
            isUploading
              ? `Uploading ${progress.done} / ${progress.total}…`
              : "Upload multiple images or videos"
          }
          disabled={readOnly || isUploading}
          loading={isUploading}
          onClick={() => fileInput.current?.click()}
        />
      </Flex>
      {failed.length > 0 && (
        <Card padding={3} radius={2} tone="critical">
          <Text size={1}>Failed to upload: {failed.join(", ")}</Text>
        </Card>
      )}
    </Stack>
  );
}
