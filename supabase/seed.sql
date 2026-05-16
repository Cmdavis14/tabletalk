-- ============================================================
-- TableTalk · Demo Seed Data
-- ============================================================
-- Safe to rerun. Restaurants are looked up by slug and created
-- only if missing. Seed issues are identified by fixed UUIDs —
-- they are deleted and reinserted each run so the data stays
-- fresh. Real guest-submitted issues (random UUIDs) are never
-- touched.
-- ============================================================

DO $$
DECLARE
  sol_id  uuid;
  goro_id uuid;
BEGIN

  -- ── 1. Restaurants ────────────────────────────────────────────────────────

  -- Sol & Smoke Kitchen
  SELECT id INTO sol_id
    FROM restaurants WHERE slug = 'sol-smoke-kitchen' LIMIT 1;

  IF sol_id IS NULL THEN
    INSERT INTO restaurants (name, slug, location, is_active)
    VALUES ('Sol & Smoke Kitchen', 'sol-smoke-kitchen', 'San Antonio, TX', true)
    RETURNING id INTO sol_id;
  ELSE
    UPDATE restaurants
       SET name = 'Sol & Smoke Kitchen', location = 'San Antonio, TX', is_active = true
     WHERE id = sol_id;
  END IF;

  -- Goro's Sushi Demo
  SELECT id INTO goro_id
    FROM restaurants WHERE slug = 'goros-sushi-demo' LIMIT 1;

  IF goro_id IS NULL THEN
    INSERT INTO restaurants (name, slug, location, is_active)
    VALUES ('Goro''s Sushi Demo', 'goros-sushi-demo', 'Austin, TX', true)
    RETURNING id INTO goro_id;
  ELSE
    UPDATE restaurants
       SET name = 'Goro''s Sushi Demo', location = 'Austin, TX', is_active = true
     WHERE id = goro_id;
  END IF;

  -- ── 2. Clear previous seed issues (fixed UUIDs only) ─────────────────────

  DELETE FROM guest_issues WHERE id IN (
    'c3d4e5f6-a7b8-9012-cdef-123456789012'::uuid,
    'd4e5f6a7-b8c9-0123-def0-234567890123'::uuid,
    'e5f6a7b8-c9d0-1234-ef01-345678901234'::uuid,
    'f6a7b8c9-d0e1-2345-f012-456789012345'::uuid,
    'a7b8c9d0-e1f2-3456-0123-567890123456'::uuid,
    'b8c9d0e1-f2a3-4567-1234-678901234567'::uuid,
    'c9d0e1f2-a3b4-5678-2345-789012345678'::uuid,
    'd0e1f2a3-b4c5-6789-3456-890123456789'::uuid,
    'e1f2a3b4-c5d6-7890-4567-901234567890'::uuid,
    'f2a3b4c5-d6e7-8901-5678-012345678901'::uuid
  );

  -- ── 3. Sol & Smoke Kitchen — 5 issues ─────────────────────────────────────

  INSERT INTO guest_issues (
    id, restaurant_id,
    issue_type, priority, status,
    is_guest_still_here, table_number, order_identifier,
    message, internal_notes,
    created_at, resolved_at
  ) VALUES

    -- #1 · Cold food · Critical · New · Still here
    (
      'c3d4e5f6-a7b8-9012-cdef-123456789012', sol_id,
      'food_problem', 'critical', 'new',
      true, '7', null,
      'Brisket came out completely cold — fat hadn''t rendered at all. This is unacceptable for a BBQ restaurant.',
      null,
      NOW() - INTERVAL '6 minutes', null
    ),

    -- #2 · Wrong order · High · In Progress · Still here
    (
      'd4e5f6a7-b8c9-0123-def0-234567890123', sol_id,
      'wrong_order', 'high', 'in_progress',
      true, '12', 'Order #142',
      'We ordered the pulled pork combo but were brought a chicken plate. My wife doesn''t eat chicken.',
      'Spoke with table — kitchen confirmed the mix-up. Correct plate is on the way.',
      NOW() - INTERVAL '18 minutes', null
    ),

    -- #3 · No server · Medium · Seen · Still here
    (
      'e5f6a7b8-c9d0-1234-ef01-345678901234', sol_id,
      'service_issue', 'medium', 'seen',
      true, '3', null,
      'We''ve been sitting here for 20 minutes and haven''t been greeted by a server. We''re ready to order.',
      null,
      NOW() - INTERVAL '31 minutes', null
    ),

    -- #4 · Long wait · Medium · Resolved · Already left
    (
      'f6a7b8c9-d0e1-2345-f012-456789012345', sol_id,
      'long_wait', 'medium', 'resolved',
      false, '5', null,
      'Waited over 45 minutes for our food. Restaurant wasn''t even that busy. We almost missed our movie.',
      'Comped dessert and apologized. Guest left satisfied.',
      NOW() - INTERVAL '2 hours', NOW() - INTERVAL '90 minutes'
    ),

    -- #5 · Double charge · Critical · In Progress · Still here
    (
      'a7b8c9d0-e1f2-3456-0123-567890123456', sol_id,
      'manager_request', 'critical', 'in_progress',
      true, '9', 'Order #138',
      'We were charged twice for the same order on my credit card. Need someone to fix this before we leave.',
      'Manager notified. Checking POS system now.',
      NOW() - INTERVAL '12 minutes', null
    );

  -- ── 4. Goro's Sushi Demo — 5 issues ───────────────────────────────────────

  INSERT INTO guest_issues (
    id, restaurant_id,
    issue_type, priority, status,
    is_guest_still_here, table_number, order_identifier,
    message, internal_notes,
    created_at, resolved_at
  ) VALUES

    -- #1 · Wrong roll · High · New · Still here (allergy)
    (
      'b8c9d0e1-f2a3-4567-1234-678901234567', goro_id,
      'wrong_order', 'high', 'new',
      true, '4', null,
      'We ordered the spicy tuna roll but were brought a California roll instead. I have a shellfish allergy — this needs to be addressed immediately.',
      null,
      NOW() - INTERVAL '4 minutes', null
    ),

    -- #2 · Long wait for sushi · Medium · Seen · Still here
    (
      'c9d0e1f2-a3b4-5678-2345-789012345678', goro_id,
      'long_wait', 'medium', 'seen',
      true, '6', null,
      'It''s been 40 minutes since we placed our sushi order. Tables that arrived after us have already received their food.',
      null,
      NOW() - INTERVAL '35 minutes', null
    ),

    -- #3 · Need manager · Critical · In Progress · Still here
    (
      'd0e1f2a3-b4c5-6789-3456-890123456789', goro_id,
      'manager_request', 'critical', 'in_progress',
      true, '2', null,
      'We''ve had multiple problems with our experience tonight and need to speak with a manager before we receive our check.',
      'Manager heading to table 2 now.',
      NOW() - INTERVAL '22 minutes', null
    ),

    -- #4 · Food different than expected · High · Resolved · Already left
    (
      'e1f2a3b4-c5d6-7890-4567-901234567890', goro_id,
      'food_problem', 'high', 'resolved',
      false, '8', 'Order #77',
      'The salmon nigiri looked nothing like the menu photo and had an unusual smell. I didn''t feel comfortable eating it.',
      'Item removed from bill. Apologized to guest.',
      NOW() - INTERVAL '90 minutes', NOW() - INTERVAL '70 minutes'
    ),

    -- #5 · Table not checked on · Medium · New · Still here
    (
      'f2a3b4c5-d6e7-8901-5678-012345678901', goro_id,
      'service_issue', 'medium', 'new',
      true, '11', null,
      'No one has come by our table in over 30 minutes. Water glasses are empty and we need to place a second round of orders.',
      null,
      NOW() - INTERVAL '9 minutes', null
    );

END $$;
