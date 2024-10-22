import Link from "next/link";
import React from "react";

const Tags = ({ children }) => {
  const tags = children.split(" ").map((tag) => tag.trim().replace(",", ""));

  return (
    <div className="_text-gray-500 dark:_text-gray-400">
      {tags.map((tag, index) => (
        <span key={index}>
          {index == 0 && `${tag} `}
          {index != 0 && (
            <Link href={`/tags/${tag}`}>
              {tag}
              {index < tags.length - 1 && ", "}
            </Link>
          )}
        </span>
      ))}
    </div>
  );
};

export default Tags;
