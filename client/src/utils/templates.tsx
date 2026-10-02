// Predefined electrical work templates
export const ELECTRICAL_TEMPLATES = [
    {
        id: 'basic-wiring',
        name: 'Basic House Wiring',
        description: 'Standard residential electrical points',
        isCustom: false,
        items: [
            { pointName: 'Light point', qty: 150, rate: 0 },
            { pointName: 'Circuit Point', qty: 50, rate: 0 },
            { pointName: 'Plug point', qty: 60, rate: 0 },
            { pointName: 'Power point', qty: 30, rate: 0 },
            { pointName: 'Intercom point', qty: 16, rate: 0 },
        ]
    },
    {
        id: 'advanced-wiring',
        name: 'Advanced Electrical Work',
        description: 'Commercial & advanced installations',
        isCustom: false,
        items: [
            { pointName: 'Light point', qty: 150, rate: 0 },
            { pointName: 'Circuit Point', qty: 50, rate: 0 },
            { pointName: 'Plug point', qty: 60, rate: 0 },
            { pointName: 'Power point', qty: 30, rate: 0 },
            { pointName: 'Intercom point', qty: 16, rate: 0 },
            { pointName: 'Networking point', qty: 35, rate: 0 },
            { pointName: 'Camera point wiring', qty: 25, rate: 0 },
            { pointName: 'Exiest point', qty: 0, rate: 0 },
        ]
    },
    {
        id: 'complete-setup',
        name: 'Complete Electrical Setup',
        description: 'Full electrical installation package',
        isCustom: false,
        items: [
            { pointName: 'Light point', qty: 150, rate: 0 },
            { pointName: 'Circuit Point', qty: 50, rate: 0 },
            { pointName: 'Plug point', qty: 60, rate: 0 },
            { pointName: 'Power point', qty: 30, rate: 0 },
            { pointName: 'Intercom point', qty: 16, rate: 0 },
            { pointName: 'Networking point', qty: 35, rate: 0 },
            { pointName: 'Camera point wiring', qty: 25, rate: 0 },
            { pointName: 'Exiest point', qty: 0, rate: 0 },
            { pointName: 'Light fitting changes', qty: 0, rate: 0 },
            { pointName: 'Switch board fitting', qty: 0, rate: 0 },
            { pointName: '10 sqmm cable fitting', qty: 0, rate: 0 },
            { pointName: '2.5 sqmm cable fitting', qty: 0, rate: 0 },
            { pointName: 'Distribution board fitting with breaking', qty: 0, rate: 0 },
        ]
    },
    {
        id: 'custom',
        name: 'Start from Scratch',
        description: 'Create your own custom quotation',
        isCustom: false,
        items: [
            { pointName: '', qty: 0, rate: 0 }
        ]
    }
];

export const getTemplateById = (id) => {
    return ELECTRICAL_TEMPLATES.find(template => template.id === id);
};

// Custom template management
const CUSTOM_TEMPLATES_KEY = 'harsh_electrical_custom_templates';

export const getCustomTemplates = () => {
    try {
        const stored = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error loading custom templates:', error);
        return [];
    }
};

export const saveCustomTemplate = (template) => {
    try {
        const customTemplates = getCustomTemplates();
        const newTemplate = {
            ...template,
            id: `custom-${Date.now()}`,
            isCustom: true,
            createdAt: new Date().toISOString(),
        };
        customTemplates.push(newTemplate);
        localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(customTemplates));
        return newTemplate;
    } catch (error) {
        console.error('Error saving custom template:', error);
        throw error;
    }
};

export const deleteCustomTemplate = (id) => {
    try {
        const customTemplates = getCustomTemplates();
        const filtered = customTemplates.filter(t => t.id !== id);
        localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error('Error deleting custom template:', error);
        throw error;
    }
};

export const getAllTemplates = () => {
    return [...ELECTRICAL_TEMPLATES, ...getCustomTemplates()];
};
