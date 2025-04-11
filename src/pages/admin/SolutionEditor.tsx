
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import SolutionEditorHeader from "@/components/admin/solution-editor/SolutionEditorHeader";
import SolutionEditorTabs from "@/components/admin/solution-editor/SolutionEditorTabs";
import { useSolutionEditor } from "@/components/admin/solution-editor/useSolutionEditor";
import { Card, CardContent } from "@/components/ui/card";

const SolutionEditor = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const {
    solution,
    loading,
    saving,
    activeTab,
    setActiveTab,
    onSubmit,
    currentValues
  } = useSolutionEditor(id, user);
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  const handleSave = () => {
    if (activeTab === "basic") {
      const form = document.querySelector("form");
      if (form) form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    } else {
      onSubmit(currentValues);
    }
  };
  
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SolutionEditorHeader 
        id={id} 
        saving={saving} 
        onSave={handleSave} 
      />
      
      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <SolutionEditorTabs 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            solution={solution}
            currentValues={currentValues}
            onSubmit={onSubmit}
            saving={saving}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SolutionEditor;
