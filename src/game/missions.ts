/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Mission } from '../types/game';

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'quest_milk_run',
    title: 'Chak 17 G Milk Delivery',
    urduTitle: 'چک 17 جی سے تازہ دودھ',
    description: 'Aliyaan Hassan, pick up fresh dairy milk cans from Uncle Shakoor at the Chak 17 G cattle pen and deliver them across the GT Road to the Emerald Mall Gourmet Bakery in the city.',
    category: 'village',
    rewardCoins: 150,
    targetPosition: [90, 0, 16],
    targetRadius: 5.5,
    targetName: 'Emerald Mall Gourmet Bakery',
    completed: false,
    hint: 'Hop into a Rickshaw or Car and drive from Chak 17 G across the Canal Bridge to the City Mall!',
  },
  {
    id: 'quest_lost_goat',
    title: 'Find the Chak 17 G Lost Goat',
    urduTitle: 'چک 17 جی کی گمشدہ بکری',
    description: 'Uncle Shakoor’s spirited white goat has wandered deep into the Chak 17 G mustard crop fields behind the primary school. Help Aliyaan find her and bring her home!',
    category: 'village',
    rewardCoins: 120,
    targetPosition: [-115, 0, -95],
    targetRadius: 4.5,
    targetName: 'Mustard Crop Field Corner',
    completed: false,
    hint: 'Search southwest of the Chak 17 G Jamia Mosque amongst the tall golden flowers.',
  },
  {
    id: 'quest_chai_master',
    title: 'Karak Chai for Teacher',
    urduTitle: 'استاد جی کے لیے کڑک چائے',
    description: 'Pick up a piping hot cup of Cardamom Karak Chai from the Chak 17 G Dhabba and bring it to Master Tariq at the Govt Primary School courtyard.',
    category: 'village',
    rewardCoins: 100,
    targetPosition: [-105, 0, 88],
    targetRadius: 4.5,
    targetName: 'School Courtyard Flagpole',
    completed: false,
    hint: 'The school is located at the western edge of Chak 17 G with the Pakistani flag.',
  },
  {
    id: 'quest_gt_speedster',
    title: 'GT Road Express Driver',
    urduTitle: 'جی ٹی روڈ ایکسپریس ڈرائیور',
    description: 'Get behind the wheel of Aliyaan’s Car, Rickshaw, or Motorbike and drive from Chak 17 G through the Canal Bridge checkpoint into the City Center!',
    category: 'driving',
    rewardCoins: 180,
    targetPosition: [65, 0, 0],
    targetRadius: 6.0,
    targetName: 'City Boulevard Entry Checkpoint',
    completed: false,
    hint: 'Follow the asphalt highway eastwards from Chak 17 G across the canal bridge.',
  },
  {
    id: 'quest_crescent_hunt',
    title: 'The 7 Sacred Crescents',
    urduTitle: 'سات مقدس ہلال',
    description: 'Search the open world to discover and collect all 7 spinning golden-green crescent relics hidden across the Mosque, Park, Bridge, and City rooftops.',
    category: 'exploration',
    rewardCoins: 350,
    targetPosition: [0, 0, 0],
    targetRadius: 5.0,
    targetName: 'Canal Bridge Apex',
    completed: false,
    hint: 'Check the Mosque courtyard, Park fountain, Mall plaza, Hospital terrace, and Village well!',
  },
];
