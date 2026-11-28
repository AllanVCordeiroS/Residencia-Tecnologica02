import * as z from "zod";

export const occurrenceKinds = [
  "Avaria de Carga",
  "Divergência Fiscal",
  "Desvio / Atraso",
  "Manutenção de Frota",
  "Vasilhame Reverso",
  "Outros",
] as const;

export const occurrenceCategories = [
  "Logística",
  "Fiscal",
  "Transporte",
  "Manutenção",
  "Estoque",
  "Outros",
] as const;

export const occurrenceSeverities = ["Crítica", "Alta", "Média", "Baixa"] as const;

export const occurrenceFormSchema = z
  .object({
    kind: z.enum(occurrenceKinds, { error: "Selecione o tipo de ocorrência." }),
    category: z.enum(occurrenceCategories, { error: "Selecione a categoria." }),
    unitId: z.string().min(1, "Selecione a unidade afetada."),
    severity: z.enum(occurrenceSeverities, { error: "Selecione a gravidade." }),
    title: z.string().trim().min(3, "Informe um título com pelo menos 3 caracteres.").max(120, "O título deve ter no máximo 120 caracteres."),
    eventDate: z.string().min(1, "Informe a data da ocorrência."),
    eventTime: z.string().min(1, "Informe o horário da ocorrência."),
    description: z.string().trim().min(10, "Descreva a ocorrência com pelo menos 10 caracteres.").max(1000, "A descrição deve ter no máximo 1.000 caracteres."),
    owner: z.string().min(1, "Selecione o responsável pela ocorrência."),
    driver: z.string().optional(),
    team: z.string().optional(),
    resolutionDeadline: z.string().min(1, "Informe o prazo para resolução."),
    priority: z.enum(occurrenceSeverities, { error: "Selecione a prioridade." }),
    observations: z.string().max(500, "As observações devem ter no máximo 500 caracteres.").optional(),
    createLinkedTask: z.boolean(),
    taskOwner: z.string().optional(),
    taskDueDate: z.string().optional(),
  })
  .superRefine((value, context) => {
    if (value.resolutionDeadline && value.eventDate && value.resolutionDeadline < value.eventDate) {
      context.addIssue({
        code: "custom",
        path: ["resolutionDeadline"],
        message: "O prazo de resolução não pode anteceder a data da ocorrência.",
      });
    }
    if (value.createLinkedTask && !value.taskOwner) {
      context.addIssue({ code: "custom", path: ["taskOwner"], message: "Selecione o responsável pela tarefa." });
    }
    if (value.createLinkedTask && !value.taskDueDate) {
      context.addIssue({ code: "custom", path: ["taskDueDate"], message: "Informe o prazo da tarefa." });
    }
    if (value.createLinkedTask && value.taskDueDate && value.eventDate && value.taskDueDate < value.eventDate) {
      context.addIssue({ code: "custom", path: ["taskDueDate"], message: "O prazo da tarefa não pode anteceder a ocorrência." });
    }
  });

export type OccurrenceFormValues = z.infer<typeof occurrenceFormSchema>;
