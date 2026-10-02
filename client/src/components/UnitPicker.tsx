import { memo, useState } from 'react';
import UnitDropdown from './UnitDropdown';
import CustomUnitModal from './CustomUnitModal';
import { useUnits } from '../context/UnitsContext';
import { CustomUnit } from '../types';
import { UnitSelection } from '../utils/units';

interface UnitPickerProps {
    unit: string;
    unitId?: string | null;
    applicableCount: number;
    getUnitUsage: (unitId: string) => number;
    onChange: (selection: UnitSelection, applyToAll: boolean) => void;
}

/** Unit dropdown plus create/edit modal for a single row. */
const UnitPicker = memo(({ unit, unitId, applicableCount, getUnitUsage, onChange }: UnitPickerProps) => {
    const { customUnits } = useUnits();
    const [modal, setModal] = useState<{ editing: CustomUnit | null } | null>(null);

    return (
        <>
            <UnitDropdown
                value={unit}
                unitId={unitId}
                customUnits={customUnits}
                applicableCount={applicableCount}
                onChange={onChange}
                onAddCustom={() => setModal({ editing: null })}
                onEditCustom={(customUnit) => setModal({ editing: customUnit })}
            />

            {modal && (
                <CustomUnitModal
                    unit={modal.editing}
                    usageCount={modal.editing ? getUnitUsage(modal.editing._id) : 0}
                    onClose={() => setModal(null)}
                    onSaved={(saved) => {
                        // A newly created unit is assigned to this row only; renames are synced by the editor.
                        if (!modal.editing) onChange({ unit: saved.name, unitId: saved._id }, false);
                    }}
                />
            )}
        </>
    );
});

UnitPicker.displayName = 'UnitPicker';

export default UnitPicker;
