// recipes.js — the menu as a modular matrix: base x protein x topping.
// Every dish is a named combination of prepared components, in plate order.
(function () {
  'use strict';

  // Raw ingredients stocked in the fridge bins, in bin order (keys 1..9).
  const INGREDIENTS = [
    { id: 'noodles', name: 'Noodles', role: 'base' },
    { id: 'rice', name: 'Rice', role: 'base' },
    { id: 'batter', name: 'Batter', role: 'base' },
    { id: 'pork', name: 'Pork', role: 'protein' },
    { id: 'egg', name: 'Egg', role: 'protein' },
    { id: 'shrimp', name: 'Shrimp', role: 'protein' },
    { id: 'onion', name: 'Spring onion', role: 'topping-chop' },
    { id: 'corn', name: 'Corn', role: 'topping-scoop' },
    { id: 'nori', name: 'Nori', role: 'topping-grab' }
  ];

  const BASES = ['noodles', 'rice', 'batter'];
  const PROTEINS = ['pork', 'egg', 'shrimp'];

  // components are prepared ids, in the order they go on the plate.
  const DISHES = [
    { id: 'miso-ramen', name: 'Midnight Miso Ramen', price: 110,
      components: ['noodles', 'pork-grilled', 'onion-chopped'] },
    { id: 'pork-rice', name: 'Lantern Pork Rice', price: 95,
      components: ['rice', 'pork-grilled', 'nori'] },
    { id: 'shrimp-oko', name: 'Neon Shrimp Okonomiyaki', price: 120,
      components: ['batter', 'shrimp-grilled', 'onion-chopped'] },
    { id: 'egg-ramen', name: 'Golden Egg Ramen', price: 90,
      components: ['noodles', 'egg-grilled', 'corn'] },
    { id: 'shrimp-rice', name: 'Moonlit Shrimp Rice', price: 115,
      components: ['rice', 'shrimp-grilled', 'onion-chopped'] },
    { id: 'egg-oko', name: 'Starlight Egg Okonomiyaki', price: 85,
      components: ['batter', 'egg-grilled', 'nori'] },
    { id: 'deluxe-ramen', name: 'Umami Deluxe Ramen', price: 150,
      components: ['noodles', 'pork-grilled', 'egg-grilled', 'onion-chopped'] },
    { id: 'corn-oko', name: 'Festival Corn Okonomiyaki', price: 100,
      components: ['batter', 'pork-grilled', 'corn'] }
  ];

  function dishById(id) {
    for (const d of DISHES) if (d.id === id) return d;
    return null;
  }

  function ingredientById(id) {
    for (const g of INGREDIENTS) if (g.id === id) return g;
    return null;
  }

  // The raw fridge ingredient a prepared component starts from.
  function rawOf(prepared) {
    return prepared.replace('-grilled', '').replace('-chopped', '');
  }

  // How a raw ingredient must be treated before it can be plated.
  function prepOf(rawId) {
    const g = ingredientById(rawId);
    if (!g) return 'plain';
    if (g.role === 'protein') return 'grill';
    if (g.role === 'topping-chop') return 'chop';
    return 'plain';
  }

  // Do two dishes share at least one prepared component (a shared prep step)?
  function sharesComponent(a, b) {
    return a.components.some((c) => b.components.indexOf(c) >= 0);
  }

  window.UR = window.UR || {};
  window.UR.INGREDIENTS = INGREDIENTS;
  window.UR.BASES = BASES;
  window.UR.PROTEINS = PROTEINS;
  window.UR.DISHES = DISHES;
  window.UR.dishById = dishById;
  window.UR.ingredientById = ingredientById;
  window.UR.rawOf = rawOf;
  window.UR.prepOf = prepOf;
  window.UR.sharesComponent = sharesComponent;
})();
