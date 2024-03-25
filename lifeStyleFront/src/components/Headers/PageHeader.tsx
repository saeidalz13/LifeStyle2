import { useSpring, animated } from "react-spring";

interface PageHeaderProps {
  text: string;
  headerType: "h1" | "h2";
}

const PageHeader = (props: PageHeaderProps) => {
  const fade = useSpring({
    from: { opacity: 0, transform: "translateY(-20px)" },
    to: { opacity: 1, transform: "translateY(0)" },
    delay: 30,
  });

  return (
    <>
      {props.headerType === "h1" ? (
        <animated.h1 style={fade} className="mt-4 mb-3 text-center">
          &#127776; {props.text} &#127776;
        </animated.h1>
      ) : (
        <animated.h2 style={fade} className="mt-4 mb-3 text-center">
          &#127776; {props.text} &#127776;
        </animated.h2>
      )}
    </>
  );
};

export default PageHeader;
