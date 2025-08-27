
import { AIPersona } from '../types';

type TFunction = (key: string) => string;

export const getAIHelperPersonas = (t: TFunction): AIPersona[] => [
    {
        name: t('persona_socrates_name'),
        systemInstruction: t('persona_socrates_instruction')
    },
    {
        name: t('persona_einstein_name'),
        systemInstruction: t('persona_einstein_instruction')
    },
    {
        name: t('persona_robot_name'),
        systemInstruction: t('persona_robot_instruction')
    }
];

export const getTutorPersonas = (t: TFunction): AIPersona[] => [
    {
        name: t('persona_einstein_name'),
        systemInstruction: t('persona_einstein_instruction')
    },
    {
        name: t('persona_tesla_name'),
        systemInstruction: t('persona_tesla_instruction')
    },
    {
        name: t('persona_porsche_name'),
        systemInstruction: t('persona_porsche_instruction')
    },
    {
        name: t('persona_curie_name'),
        systemInstruction: t('persona_curie_instruction')
    }
];
