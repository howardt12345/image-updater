import { css } from 'styled-components';
import theme from './theme';
const { colors, fontSizes, fonts } = theme;

const mixins = {
  flexCenter: css`
    display: flex;
    justify-content: center;
    align-items: center;
  `,

  flexBetween: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
  `,

  outline: css`
    outline: 1px solid red;
  `,

  link: css`
    display: inline-block;
    text-decoration: none;
    text-decoration-skip-ink: auto;
    color: inherit;
    position: relative;
    transition: ${theme.transition};
    cursor: pointer;
    &:hover,
    &:active,
    &:focus {
      color: ${colors.accent};
      outline: 0;
    }
  `,

  inlineLink: css`
    display: inline-block;
    text-decoration: none;
    text-decoration-skip-ink: auto;
    position: relative;
    transition: ${theme.transition};
    cursor: pointer;
    color: ${colors.accent};
    &:hover,
    &:focus,
    &:active {
      color: ${colors.accent};
      outline: 0;
      &:after {
        width: 100%;
      }
      & > * {
        color: ${colors.accent} !important;
        transition: ${theme.transition};
      }
    }
    &:after {
      content: '';
      display: block;
      width: 0;
      height: 1px;
      position: relative;
      bottom: 0.37em;
      background-color: ${colors.accent};
      transition: ${theme.transition};
      opacity: 0.5;
    }
  `,

  smallButton: css`
    color: ${colors.accent};
    background-color: transparent;
    border: 1px solid ${colors.accent};
    border-radius: ${theme.borderRadius};
    padding: 0.75rem 1rem;
    font-size: ${fontSizes.smish};
    font-family: ${fonts.Raleway};
    line-height: 1;
    text-decoration: none;
    cursor: pointer;
    transition: ${theme.transition};
    &:hover,
    &:focus,
    &:active {
      background-color: ${colors.translucent_accent};
    }
    &:after {
      display: none !important;
    }
  `,

  bigButton: css`
    color: ${colors.accent};
    background-color: transparent;
    border: 1px solid ${colors.accent};
    border-radius: ${theme.borderRadius};
    padding: 1rem 1.75rem;
    font-size: ${fontSizes.sm};
    font-family: ${fonts.Raleway};
    line-height: 1;
    text-decoration: none;
    cursor: pointer;
    transition: ${theme.transition};
    &:hover,
    &:focus,
    &:active {
      background-color: ${colors.translucent_accent};
    }
    &:after {
      display: none !important;
    }
  `,

  boxShadow: css`
    box-shadow: 0 10px 30px -15px ${colors.shadow_bg};
    transition: ${theme.transition};
    &:hover,
    &:focus {
      box-shadow: 0 20px 30px -15px ${colors.shadow_bg};
    }
  `,

  fancyList: css`
    padding: 0;
    margin: 0;
    list-style: none;
    font-size: ${fontSizes.lg};
    li {
      position: relative;
      padding-left: 30px;
      margin-bottom: 10px;
      &:before {
        content: '▹';
        position: absolute;
        left: 0;
        color: ${colors.accent};
      }
    }
  `,
};

export default mixins;