import { ComponentProps } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

interface QuestionMarkOverlayProps {
  text: string;
}

const QuestionMarkOverlay = (props: QuestionMarkOverlayProps) => {
  const renderTooltip = (propsComp: ComponentProps<typeof Tooltip>) => (
    <Tooltip id="button-tooltip" {...propsComp}>
      {props.text}
    </Tooltip>
  );

  return (
    <OverlayTrigger
      placement="right"
      delay={{ show: 250, hide: 400 }}
      overlay={renderTooltip}
    >
      <span className="question-mark">?</span>
    </OverlayTrigger>
  );
};

export default QuestionMarkOverlay;
