// Create Journey Modal

import { useState } from 'react';
import { createJourney, CreateJourneyInput } from '@/api/journeys';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface Props {
  onClose: () => void;
  onSuccess: (journeyId: string) => void;
}

interface DimensionInput {
  name: string;
  description: string;
  weight: number;
}

export function CreateJourneyModal({ onClose, onSuccess }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [dimensions, setDimensions] = useState<DimensionInput[]>([
    { name: '', description: '', weight: 3 },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addDimension = () => {
    if (dimensions.length < 10) {
      setDimensions([...dimensions, { name: '', description: '', weight: 3 }]);
    }
  };

  const removeDimension = (index: number) => {
    if (dimensions.length > 1) {
      setDimensions(dimensions.filter((_, i) => i !== index));
    }
  };

  const updateDimension = (index: number, field: keyof DimensionInput, value: string | number) => {
    const updated = [...dimensions];
    updated[index] = { ...updated[index], [field]: value };
    setDimensions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    const validDimensions = dimensions.filter((d) => d.name.trim());
    if (validDimensions.length === 0) {
      setError('At least one dimension is required');
      return;
    }

    setIsLoading(true);

    try {
      const input: CreateJourneyInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        isPublic,
        dimensions: validDimensions.map((d) => ({
          name: d.name.trim(),
          description: d.description.trim() || undefined,
          weight: d.weight,
        })),
      };

      const createdJourney = await createJourney(input);
      onSuccess(createdJourney.id);
    } catch (err: any) {
      console.error('Failed to create journey:', err);
      setError(err.response?.data?.error?.message || 'Failed to create journey');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={true} onClose={onClose} size="lg">
      <div className="space-y-6 p-6">
        <div>
          <h2 className="text-2xl font-bold text-text">Create New Journey</h2>
          <p className="text-muted mt-1">
            Start tracking your progress across multiple dimensions
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 30-Day Fitness Challenge"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-background text-text"
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this journey about?"
              rows={3}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-background text-text resize-none"
              maxLength={500}
            />
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Visibility
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={isPublic}
                  onChange={() => setIsPublic(true)}
                  className="w-4 h-4 text-primary-500"
                />
                <span className="text-text">Public (anyone can join)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!isPublic}
                  onChange={() => setIsPublic(false)}
                  className="w-4 h-4 text-primary-500"
                />
                <span className="text-text">Private (invite only)</span>
              </label>
            </div>
          </div>

          {/* Dimensions */}
          <div>
            <label className="block text-sm font-medium text-text mb-3">
              Dimensions *
            </label>

            <div className="space-y-4">
              {dimensions.map((dimension, index) => (
                <div
                  key={index}
                  className="p-4 border border-border rounded-lg space-y-3"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        value={dimension.name}
                        onChange={(e) =>
                          updateDimension(index, 'name', e.target.value)
                        }
                        placeholder={`Dimension ${index + 1} name (e.g. Cardio)`}
                        className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary-500 bg-background text-text text-sm"
                        maxLength={50}
                      />
                      <input
                        type="text"
                        value={dimension.description}
                        onChange={(e) =>
                          updateDimension(index, 'description', e.target.value)
                        }
                        placeholder="Description (optional)"
                        className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary-500 bg-background text-text text-sm"
                        maxLength={200}
                      />
                      <div>
                        <label className="block text-xs text-muted mb-1">
                          Weight: {dimension.weight}
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={dimension.weight}
                          onChange={(e) =>
                            updateDimension(index, 'weight', parseInt(e.target.value))
                          }
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted mt-1">
                          <span>Less important</span>
                          <span>Very important</span>
                        </div>
                      </div>
                    </div>
                    {dimensions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDimension(index)}
                        className="text-danger hover:text-red-700 text-sm mt-2"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Add Dimension Button - Moved to bottom */}
              <button
                type="button"
                onClick={addDimension}
                disabled={dimensions.length >= 10}
                className="w-full p-3 border-2 border-dashed border-border rounded-lg text-primary-500 hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                + Add Another Dimension {dimensions.length >= 10 && '(Max 10)'}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-danger text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Journey'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

