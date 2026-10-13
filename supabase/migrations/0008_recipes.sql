create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  description text not null check (char_length(description) between 1 and 300),
  minutes smallint not null check (minutes between 1 and 600),
  ingredients text[] not null check (cardinality(ingredients) >= 2),
  steps text[] not null check (cardinality(steps) >= 2),
  categories text[] not null
    check (
      cardinality(categories) >= 1
      and categories <@ array['produce', 'dairy', 'meat_fish', 'bakery', 'dry_goods', 'cooked_meals', 'drinks', 'other']
    ),
  -- The food preferences a recipe satisfies; nut_allergy means it contains no nuts.
  diets text[] not null default '{}'
    check (diets <@ array['halal', 'vegetarian', 'vegan', 'gluten_free', 'nut_allergy', 'dairy_free']),
  created_at timestamptz not null default now()
);

alter table public.recipes enable row level security;

create policy "Signed-in users can read recipes"
  on public.recipes for select
  to authenticated
  using (true);

-- Recipes change only through migrations. Supabase grants new tables to both roles by default.
revoke all on public.recipes from anon, authenticated;
grant select on public.recipes to authenticated;

insert into public.recipes (title, description, minutes, ingredients, steps, categories, diets) values
(
  'Spinach and Cheese Omelette',
  'A quick breakfast that uses up spinach and the last of the cheese.',
  10,
  array['3 eggs', '1 handful of spinach', '50 g cheese, grated', '1 tsp butter or oil', 'Salt and pepper'],
  array['Beat the eggs with salt and pepper.', 'Melt the butter in a pan and wilt the spinach for one minute.', 'Pour in the eggs and cook on medium heat until almost set.', 'Add the cheese, fold the omelette in half and serve.'],
  array['produce', 'dairy'],
  array['halal', 'vegetarian', 'gluten_free', 'nut_allergy']
),
(
  'Fresh Tomato Pasta',
  'A simple sauce for ripe tomatoes that are past their best.',
  20,
  array['250 g dried pasta (egg-free)', '4 ripe tomatoes, chopped', '2 cloves garlic, sliced', '2 tbsp olive oil', 'Salt, pepper and dried oregano'],
  array['Boil the pasta in salted water until tender.', 'Warm the oil with the garlic, then add the tomatoes and simmer for 10 minutes.', 'Season with salt, pepper and oregano.', 'Toss the drained pasta with the sauce and serve.'],
  array['dry_goods', 'produce'],
  array['halal', 'vegetarian', 'vegan', 'dairy_free', 'nut_allergy']
),
(
  'French Toast',
  'Day-old bread and eggs become a sweet breakfast.',
  15,
  array['4 slices of bread, a day old is ideal', '2 eggs', '1/2 cup milk', '1 tsp sugar', '1 tsp butter or oil for the pan'],
  array['Whisk the eggs, milk and sugar in a shallow dish.', 'Soak each slice of bread for 20 seconds per side.', 'Cook in a buttered pan on medium heat until golden on both sides.', 'Serve warm with fruit or honey.'],
  array['bakery', 'dairy'],
  array['halal', 'vegetarian', 'nut_allergy']
),
(
  'Vegetable Stir Fry',
  'Any mix of tired vegetables, ready in minutes.',
  20,
  array['3 cups mixed vegetables, sliced', '2 cloves garlic, sliced', '1 tbsp oil', '2 tbsp soy sauce (halal-certified)', 'Cooked rice or egg-free noodles to serve'],
  array['Heat the oil in a wide pan or wok on high heat.', 'Fry the garlic for 30 seconds, then add the hardest vegetables first.', 'Add the softer vegetables and the soy sauce and toss for 3 minutes.', 'Serve over rice or egg-free noodles.'],
  array['produce', 'dry_goods'],
  array['halal', 'vegetarian', 'vegan', 'dairy_free', 'nut_allergy']
),
(
  'Red Lentil Soup',
  'A warming soup from pantry staples and a couple of vegetables.',
  30,
  array['1 cup red lentils, rinsed', '1 onion, chopped', '1 carrot, chopped', '1 tsp ground cumin', '4 cups water or vegetable stock', 'Lemon juice and salt'],
  array['Cook the onion and carrot in a little oil for 5 minutes.', 'Add the cumin, lentils and water or vegetable stock and bring to the boil.', 'Simmer for 20 minutes until the lentils are soft.', 'Blend if you like, then season with lemon juice and salt.'],
  array['dry_goods', 'produce'],
  array['halal', 'vegetarian', 'vegan', 'dairy_free', 'gluten_free', 'nut_allergy']
),
(
  'Chicken Fried Rice',
  'Turns leftover rice and a little chicken into a full meal.',
  25,
  array['2 cups cooked rice, cooled', '1 chicken breast, diced', '1 cup mixed vegetables, chopped small', '2 eggs', '2 tbsp soy sauce (halal-certified)', '1 tbsp oil'],
  array['Fry the chicken in the oil until cooked through, then set aside.', 'Scramble the eggs in the same pan and break them up.', 'Add the vegetables and cook for 3 minutes, then add the rice and soy sauce.', 'Return the chicken, toss on high heat for 3 minutes and serve.'],
  array['meat_fish', 'produce', 'dry_goods', 'cooked_meals'],
  array['halal', 'dairy_free', 'nut_allergy']
),
(
  'Tuna Sandwich',
  'A fast lunch from a tin of tuna and a few salad leftovers.',
  10,
  array['1 can tuna, drained', '2 tbsp yoghurt or mayonnaise', '1 stick of celery or a small cucumber, chopped', '4 slices of bread', 'Salt, pepper and lemon juice'],
  array['Mix the tuna with the yoghurt or mayonnaise and the chopped celery or cucumber.', 'Season with salt, pepper and lemon juice.', 'Spread on two slices of bread and top with the other slices.'],
  array['meat_fish', 'bakery', 'produce', 'dairy'],
  array['halal', 'nut_allergy']
),
(
  'Shakshuka',
  'Eggs poached in a spiced tomato and pepper sauce.',
  25,
  array['4 eggs', '4 ripe tomatoes, chopped', '1 onion, sliced', '1 bell pepper, sliced', '2 cloves garlic, sliced', '1 tsp each of ground cumin and paprika', '1 tbsp olive oil'],
  array['Soften the onion and pepper in the oil for 5 minutes, then add the garlic and spices.', 'Add the tomatoes and simmer for 10 minutes until thick.', 'Make four wells in the sauce and crack an egg into each.', 'Cover and cook for 5 minutes until the whites are set, then serve straight from the pan.'],
  array['produce', 'dairy'],
  array['halal', 'vegetarian', 'gluten_free', 'dairy_free', 'nut_allergy']
),
(
  'Yoghurt Fruit Parfait',
  'A no-cook snack for yoghurt and fruit that need eating.',
  5,
  array['1 cup yoghurt', '1 banana or a handful of berries, sliced', '1 tbsp honey', '2 tbsp rolled oats'],
  array['Spoon half of the yoghurt into a glass.', 'Add half of the fruit and oats.', 'Repeat the layers and drizzle with honey.'],
  array['dairy', 'produce', 'dry_goods'],
  array['halal', 'vegetarian', 'nut_allergy']
),
(
  'Cheese Toastie',
  'Bread and cheese, toasted until golden.',
  10,
  array['4 slices of bread', '100 g cheese, sliced or grated', '1 tomato, sliced (optional)', '1 tsp butter'],
  array['Butter the outside of each slice of bread.', 'Fill with the cheese and tomato.', 'Toast in a pan on medium heat for 3 minutes per side until golden and melted.'],
  array['bakery', 'dairy', 'produce'],
  array['halal', 'vegetarian', 'nut_allergy']
),
(
  'Egg Fried Rice',
  'The classic way to use up cold cooked rice.',
  15,
  array['2 cups cooked rice, cold', '3 eggs', '1 cup frozen or fresh vegetables', '2 spring onions, sliced', '1 tbsp soy sauce (halal-certified)', '1 tbsp oil'],
  array['Scramble the eggs in the hot oil and break them into pieces.', 'Add the vegetables and cook for 2 minutes.', 'Add the rice and soy sauce and toss on high heat for 3 minutes.', 'Finish with the spring onions.'],
  array['cooked_meals', 'dairy', 'produce', 'dry_goods'],
  array['halal', 'vegetarian', 'dairy_free', 'nut_allergy']
),
(
  'Chicken Shawarma Bowl',
  'Spiced chicken with rice, fresh vegetables and a garlic yoghurt sauce.',
  30,
  array['2 chicken breasts, sliced', '2 tsp shawarma spice mix (check it is gluten-free)', '1 cup rice, cooked', '1 cucumber and 2 tomatoes, chopped', '1/2 cup yoghurt mixed with 1 clove crushed garlic'],
  array['Toss the chicken with the spice mix and a spoon of oil.', 'Fry in a hot pan for 8 minutes until browned and cooked through.', 'Divide the rice between bowls and add the chicken and chopped vegetables.', 'Top with the garlic yoghurt.'],
  array['meat_fish', 'dry_goods', 'produce', 'dairy'],
  array['halal', 'gluten_free', 'nut_allergy']
),
(
  'Baked Fish with Lemon and Vegetables',
  'One tray, minimal washing up.',
  30,
  array['2 white fish fillets', '2 potatoes, sliced thin', '1 courgette, sliced', '1 lemon, sliced', '2 tbsp olive oil', 'Salt, pepper and dried herbs'],
  array['Heat the oven to 200 C and toss the potatoes and courgette with half the oil on a tray.', 'Roast for 15 minutes.', 'Place the fish on top, add the lemon, drizzle with the remaining oil and season.', 'Bake for 12 minutes until the fish flakes easily.'],
  array['meat_fish', 'produce'],
  array['halal', 'gluten_free', 'dairy_free', 'nut_allergy']
),
(
  'Rice Pudding from Leftover Rice',
  'A creamy dessert from cooked rice and milk.',
  25,
  array['1 cup cooked rice', '2 cups milk', '2 tbsp sugar', '1/2 tsp ground cardamom'],
  array['Combine the rice, milk and sugar in a saucepan.', 'Simmer on low heat for 20 minutes, stirring often, until thick.', 'Stir in the cardamom and serve warm or chilled.'],
  array['cooked_meals', 'dairy'],
  array['halal', 'vegetarian', 'gluten_free', 'nut_allergy']
),
(
  'Leftover Curry Wraps',
  'Turn last night''s curry into a handheld lunch.',
  10,
  array['1 cup leftover curry or cooked meat with sauce', '2 flatbreads or tortillas', '1 handful of lettuce or shredded cabbage', '2 tbsp yoghurt'],
  array['Reheat the curry until hot and thick.', 'Warm the flatbreads in a dry pan.', 'Fill with the curry, lettuce and a spoon of yoghurt, then roll up.'],
  array['cooked_meals', 'bakery', 'produce', 'dairy'],
  array[]::text[]
),
(
  'Tomato and Bread Soup',
  'Old bread and ripe tomatoes make a thick, comforting soup.',
  25,
  array['4 ripe tomatoes, chopped', '3 slices of day-old bread, torn', '2 cloves garlic, sliced', '2 tbsp olive oil', '2 cups water or vegetable stock', 'Salt, pepper and basil'],
  array['Warm the oil and garlic, add the tomatoes and cook for 8 minutes.', 'Add the water or vegetable stock and the bread and simmer for 10 minutes.', 'Stir until the bread breaks down, season and serve with basil.'],
  array['produce', 'bakery'],
  array['halal', 'vegetarian', 'nut_allergy']
),
(
  'Karak Chai',
  'Strong spiced milk tea, a UAE favourite.',
  10,
  array['2 cups water', '2 tea bags or 2 tsp loose black tea', '1 cup milk', '2 tbsp sugar', '2 cardamom pods, crushed'],
  array['Boil the water with the cardamom and tea for 3 minutes.', 'Add the milk and sugar and bring back to the boil.', 'Simmer for 2 minutes, strain and serve hot.'],
  array['drinks', 'dairy'],
  array['halal', 'vegetarian', 'gluten_free', 'nut_allergy']
),
(
  'Mint Lemonade',
  'Fresh and cold, a good home for lemons and herbs.',
  5,
  array['4 lemons, juiced', '1 handful of fresh mint', '3 tbsp sugar', '3 cups cold water', 'Ice'],
  array['Crush the mint with the sugar in a jug.', 'Add the lemon juice and cold water and stir until the sugar dissolves.', 'Serve over ice.'],
  array['drinks', 'produce'],
  array['halal', 'vegetarian', 'vegan', 'dairy_free', 'gluten_free', 'nut_allergy']
);
