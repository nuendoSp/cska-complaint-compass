-- Add rating column to complaints table
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS rating INTEGER;

-- Add comment to the column
COMMENT ON COLUMN complaints.rating IS 'Rating from 1 to 5 given by the user';

-- Add check constraint to ensure rating is between 1 and 5
ALTER TABLE complaints ADD CONSTRAINT rating_check CHECK (rating >= 1 AND rating <= 5 OR rating IS NULL); 