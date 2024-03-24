import { CSSProperties } from "react";

interface MainHeaderProps {
  text: string;
  style: CSSProperties | null;
}

const MainDivHeader = (props: MainHeaderProps) => {
  return (
    <>
      {!props.style ? (
        <h3>
          <span style={{ color: "#F4A9A8" }}>{props.text}</span>
        </h3>
      ) : (
        <h3 style={props.style}>
          <span style={{ color: "#F4A9A8" }}>{props.text}</span>
        </h3>
      )}
    </>
  );
};

export default MainDivHeader;
