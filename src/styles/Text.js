import styled from 'styled-components';
import media from './media';
import theme from './theme';
const { colors, fonts } = theme;

export const Title = styled.h1`
  text-align: center;
  color: ${colors.textPrimary};
  font-family: ${fonts.Poppins};
  font-size: 64px;
  line-height: 0.75;
  font-weight: 400;
  ${media.bigDesktop`font-size: 64px;`};
  ${media.tablet`font-size: 56px;`};
`;
