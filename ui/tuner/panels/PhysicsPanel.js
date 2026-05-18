import { createSectionHeader, createSlider } from '../TunerHelpers.js';

export class PhysicsPanel {
  constructor(physicsData) {
    this.physicsData = physicsData;
  }

  render(container) {
    container.innerHTML = '';
    const d = this.physicsData;
    if (!d) return;
    
    createSectionHeader(container, 'Gravity');
    createSlider(container, 'Upward Gravity', d, 'gravity_up', 0.1, 3.0, 0.05);
    createSlider(container, 'Downward Gravity', d, 'gravity_down', 0.5, 5.0, 0.1);
    createSlider(container, 'Apex Gravity (Float)', d, 'gravity_apex', 0.05, 1.5, 0.01);
    
    createSectionHeader(container, 'Jumping');
    createSlider(container, 'Ground Jump Power', d, 'jump_ground_power', 5, 40, 1);
    createSlider(container, 'Air Jump Base', d, 'jump_air_base', 5, 30, 1);
    createSlider(container, 'Air Jump Mult Min', d, 'jump_air_mult_min', 0.1, 2.0, 0.1);
    createSlider(container, 'Air Jump Mult Max', d, 'jump_air_mult_max', 0.1, 2.0, 0.1);
    
    createSectionHeader(container, 'Locomotion');
    createSlider(container, 'Ground Accel', d, 'accel_ground', 10, 100, 1);
    createSlider(container, 'Air Accel', d, 'accel_air', 1, 50, 1);
    createSlider(container, 'Ground Friction', d, 'friction_ground', 0.8, 0.999, 0.001);
    createSlider(container, 'Air Friction', d, 'friction_air', 0.9, 1.0, 0.001);
    createSlider(container, 'Slide Friction', d, 'friction_slide', 0.9, 1.0, 0.001);
    createSlider(container, 'Crouch Friction', d, 'friction_crouch', 0.5, 0.99, 0.01);
  }
}