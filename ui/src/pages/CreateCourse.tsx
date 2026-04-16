import { useState } from "react";
import { WizardStepper } from "@/components/course-builder/WizardStepper";
import { StepMetadata } from "@/components/course-builder/StepMetadata";
import { StepStructure } from "@/components/course-builder/StepStructure";
import { StepQuiz } from "@/components/course-builder/StepQuiz";
import { StepPreview } from "@/components/course-builder/StepPreview";
import { CourseBuilderProvider, useCourseBuilder } from "@/context/CourseBuilderContext";
import { Button } from "@/components/ui/button";
import { saveBuiltCourse } from "@/services/courseApi";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

function CourseBuilderWizard() {
  const { state, dispatch } = useCourseBuilder();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleNext = async () => {
    if (state.currentStep < 3) {
      dispatch({ type: "SET_STEP", payload: state.currentStep + 1 });
    } else {
      // Step 3 -> Publishing
      try {
        setSubmitting(true);
        toast.loading("Publishing built course...", { id: "publish" });
        const createdCourse = await saveBuiltCourse(state.course);
        toast.success("Course published successfully!", { id: "publish" });
        navigate(`/courses/${createdCourse.id}`);
      } catch (e: any) {
        toast.error(`Publish failed: ${e.message}`, { id: "publish" });
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (state.currentStep > 0) {
      dispatch({ type: "SET_STEP", payload: state.currentStep - 1 });
    }
  };

  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 0:
        return <StepMetadata />;
      case 1:
        return <StepStructure />;
      case 2:
        return <StepQuiz />;
      case 3:
        return <StepPreview />;
      default:
        return <StepMetadata />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background animate-fade-in">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
        <WizardStepper />
      </header>

      <main className="flex-1 overflow-auto">
        {renderCurrentStep()}
      </main>

      <footer className="sticky bottom-0 z-10 bg-background/80 backdrop-blur-md border-t p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={handleBack} 
            disabled={state.currentStep === 0}
          >
            Back
          </Button>
          <div className="space-x-4">
            <Button variant="secondary" onClick={() => toast.info("Draft saved locally.")}>
              Save Draft
            </Button>
            <Button onClick={handleNext} disabled={submitting}>
              {state.currentStep === 3 ? (submitting ? "Publishing..." : "Publish Course") : "Next"}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function CreateCourse() {
  return (
    <CourseBuilderProvider>
      <CourseBuilderWizard />
    </CourseBuilderProvider>
  );
}
