import type {ChangeState} from '@/components/useCardElement';

const cardFieldConfig: Array<{
    key: 'csc' | 'expiry' | 'name' | 'pan';
    wrapId: string;
    labelId: string;
    baseLabel: string;
}> = [
    {key: 'csc', wrapId: 'csc-wrap', labelId: 'csc-label', baseLabel: 'CSC'},
    {key: 'expiry', wrapId: 'expiry-wrap', labelId: 'expiry-label', baseLabel: 'Expiry (MM/YY)'},
    {key: 'name', wrapId: 'name-wrap', labelId: 'name-label', baseLabel: 'Name on card'},
    {key: 'pan', wrapId: 'pan-wrap', labelId: 'pan-label', baseLabel: 'Card number'},
];

export function updateCardFieldFeedback(changeState: ChangeState) {
    cardFieldConfig.forEach(({key, wrapId, labelId, baseLabel}) => {
        const wrap = document.getElementById(wrapId);
        const label = document.getElementById(labelId);
        const field = changeState[key];
        const isInvalid = Boolean(field && !field.valid);

        if (wrap) {
            wrap.style.borderColor = isInvalid ? 'red' : '#e5e7eb';
        }

        if (label) {
            label.innerText = field?.message ? `${baseLabel} (${field.message})` : baseLabel;
            label.style.color = isInvalid ? 'red' : '#64748b';
        }
    });
}
