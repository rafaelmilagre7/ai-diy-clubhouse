
import { CreateTopicDialog } from "./CreateTopicDialog";
import { useState } from "react";

export const CommunitySidebarModern = () => {
  const [createTopicOpen, setCreateTopicOpen] = useState(false);

  return (
    <div className="space-y-6">
      <CreateTopicDialog open={createTopicOpen} onOpenChange={setCreateTopicOpen} />
    </div>
  );
};
