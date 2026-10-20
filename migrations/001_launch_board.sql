CREATE TABLE guide_launches (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title text NOT NULL,
  category text NOT NULL,
  state text NOT NULL CHECK (state IN ('Planned', 'Building', 'Shipped'))
);

-- These are sample records, not live Helicarrier product or customer data.
INSERT INTO guide_launches (title, category, state) VALUES
  ('Give the idea a home', 'Application', 'Shipped'),
  ('Connect the data layer', 'PostgreSQL', 'Shipped'),
  ('Ship the next small thing', 'Your idea', 'Building'),
  ('Let an agent lend a hand', 'Automation', 'Planned');
