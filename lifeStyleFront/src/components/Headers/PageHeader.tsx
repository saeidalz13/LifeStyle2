import { useSpring, animated } from "react-spring";

interface PageHeaderProps {
  text: string;
}

const PageHeader = (props: PageHeaderProps) => {
  const fade = useSpring({
    from: { opacity: 0, transform: "translateY(-20px)" },
    to: { opacity: 1, transform: "translateY(0)" },
    delay: 30,
  });

  return (
    <animated.h1 style={fade} className="mt-4 mb-4">
      &#127776; {props.text} &#127776;
    </animated.h1>
  );
};

export default PageHeader;
