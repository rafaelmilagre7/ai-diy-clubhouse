
import { useState } from "react";
import { ResourceMetadata } from "../types/ResourceTypes";

export function useResourceDialog() {
  const [showNewResourceDialog, setShowNewResourceDialog] = useState(false);
  const [newResource, setNewResource] = useState<ResourceMetadata>({
    title: "",
    description: "",
    url: "",
    type: "document",
    tags: [],
    order: 0,
    downloads: 0
  });

  const resetNewResource = () => {
    setNewResource({
      title: "",
      description: "",
      url: "",
      type: "document",
      tags: [],
      order: 0,
      downloads: 0
    });
  };

  return {
    showNewResourceDialog,
    setShowNewResourceDialog,
    newResource,
    setNewResource,
    resetNewResource
  };
}
