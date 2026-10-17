import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { NavigationDemo, NavigationReview } from './navigation-review';
import styles from './navigation-review.module.css';

const meta = {
  title: 'Components/Guardian navigation',
  component: NavigationDemo,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof NavigationDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ReviewPage: Story = { render: () => <NavigationReview /> };
export const Desktop: Story = {
  render: () => <NavigationDemo name="Desktop" />,
};
export const IphoneBottom: Story = {
  render: () => (
    <div className={styles.phone}>
      <NavigationDemo name="iPhone onderbalk" />
    </div>
  ),
};
export const IphoneMenu: Story = {
  render: () => (
    <div className={styles.phone}>
      <NavigationDemo mobileNavigation="menu" name="iPhone menu" />
    </div>
  ),
};
export const MenuKeyboard: Story = {
  ...IphoneMenu,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Navigatie openen' });
    toggle.focus();
    await userEvent.keyboard('{Enter}');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const nav = canvas.getByRole('navigation', { name: /^Hoofdnavigatie/ });
    await expect(
      within(nav).getByRole('link', { name: 'Overzicht' }),
    ).toHaveAttribute('aria-current', 'page');
    await userEvent.click(
      within(nav).getByRole('link', { name: 'Weekplanning' }),
    );
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toHaveFocus();
    await expect(
      canvas.getByRole('heading', { name: 'Weekplanning' }),
    ).toBeVisible();
    await userEvent.keyboard('{Enter}');
    await userEvent.tab();
    await userEvent.keyboard('{Escape}');
    await expect(toggle).toHaveFocus();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  },
};
export const BottomNavigation: Story = {
  ...IphoneBottom,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = within(
      canvas.getByRole('navigation', { name: /^Mobiele navigatie/ }),
    );
    await userEvent.click(nav.getByRole('link', { name: 'Planning' }));
    await expect(
      canvas.getByRole('heading', { name: 'Weekplanning' }),
    ).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Planning' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    const more = nav.getByRole('button', { name: 'Meer' });
    await userEvent.click(more);
    await userEvent.click(canvas.getByRole('link', { name: 'Beheer' }));
    await expect(canvas.getByRole('heading', { name: 'Beheer' })).toBeVisible();
    await expect(more).toHaveFocus();
    await expect(more).toHaveAttribute('aria-expanded', 'false');
    await expect(more).toHaveAttribute('data-current', 'true');
  },
};
