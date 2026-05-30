import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { QUESTIONNAIRE_QUESTIONS, type QuestionnaireAnswers } from "@/lib/maternidad/types";

interface QuestionnaireFormProps {
  answers: QuestionnaireAnswers;
  onChange: (answers: QuestionnaireAnswers) => void;
  disabled?: boolean;
  title?: string;
}

export function QuestionnaireForm({ answers, onChange, disabled, title }: QuestionnaireFormProps) {
  const setAnswer = (key: keyof QuestionnaireAnswers, value: boolean) => {
    onChange({ ...answers, [key]: value });
  };

  return (
    <div className="space-y-6">
      {title && <h3 className="text-lg font-semibold">{title}</h3>}
      {QUESTIONNAIRE_QUESTIONS.map((q) => (
        <div key={q.key} className="rounded-lg border border-border p-4">
          <Label className="text-base font-medium">{q.label}</Label>
          <RadioGroup
            className="mt-3 flex gap-6"
            value={answers[q.key] === null ? "" : answers[q.key] ? "yes" : "no"}
            onValueChange={(v) => setAnswer(q.key, v === "yes")}
            disabled={disabled}
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="yes" id={`${q.key}-yes`} />
              <Label htmlFor={`${q.key}-yes`} className="font-normal">
                Sí
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="no" id={`${q.key}-no`} />
              <Label htmlFor={`${q.key}-no`} className="font-normal">
                No
              </Label>
            </div>
          </RadioGroup>
        </div>
      ))}
    </div>
  );
}
