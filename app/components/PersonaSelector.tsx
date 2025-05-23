import { personas } from '../demo-config';

interface PersonaSelectorProps {
  onPersonaChange: (personaKey: string) => void;
  disabled?: boolean;
}

const PersonaSelector: React.FC<PersonaSelectorProps> = ({ onPersonaChange, disabled }) => {
  return (
    <div className="mb-6">
      <select
        className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-blue-500"
        onChange={(e) => onPersonaChange(e.target.value)}
        disabled={disabled}
        defaultValue=""
      >
        <option value="" disabled>Select Customer Type</option>
        {Object.entries(personas).map(([key, value]) => (
          <option key={key} value={key} className="text-white bg-gray-700">
            {value.name}
          </option>
        ))}
      </select>
      <p className="mt-2 text-sm text-gray-400">
        Select a customer scenario and click "Start Training Call" to begin the simulation.
      </p>
    </div>
  );
};

export default PersonaSelector;