import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import SearchIcon from "@mui/icons-material/Search";

import placeholderImg from "@/assets/placeholder.png";

const featureSections: {
    title: string;
    subtitle: string;
    description: string;
    path: string;
}[] = [
        {
            title: "路網圖查詢",
            subtitle: "互動式路網圖",
            description:
                "透過動態路網圖，輕鬆瀏覽臺北捷運各站資訊，快速掌握路線與轉乘方式。",
            path: "/network-map",
        },
        {
            title: "車站聊天室",
            subtitle: "即時交流平台",
            description:
                "在車站專屬聊天室中與其他旅客即時交流，分享搭乘心得與周邊資訊。",
            path: "/chat-room",
        },
        {
            title: "客製化旅程",
            subtitle: "專屬旅程規劃",
            description:
                "依據您的需求客製化規劃捷運旅程，打造最適合您的出行路線。",
            path: "/trip-planner",
        },
        {
            title: "車站書籤",
            subtitle: "收藏常用車站",
            description:
                "將常用或感興趣的車站加入書籤，隨時快速查看車站資訊。",
            path: "/station-bookmark",
        },
    ];

const HomePage = () => {
    const navigate = useNavigate();

    const [searchValue, setSearchValue] = useState("");

    const handleSearch = (): void => {
        navigate("/network-map");
    };

    const handleKeyDown = (e: React.KeyboardEvent): void => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <Box>
            {/* Banner Section */}
            <Box
                sx={{
                    position: "relative",
                    width: "100vw",
                    left: "50%",
                    transform: "translateX(-50%)",
                    minHeight: "640px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    overflow: "hidden",
                }}
            >
                <Box
                    component="img"
                    src={placeholderImg}
                    alt="背景圖片"
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        zIndex: 0,
                    }}
                />
                <Box
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.4)",
                        zIndex: 1,
                    }}
                />
                <Box
                    sx={{
                        position: "relative",
                        zIndex: 2,
                        pr: { xs: 4, md: 10 },
                        pl: { xs: 4, md: 0 },
                        py: 6,
                        maxWidth: "600px",
                    }}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            color: "#FFFFFF",
                            mb: 1.5,
                            fontSize: { xs: "1.5rem", md: "2rem" },
                        }}
                    >
                        查詢您有興趣的臺北捷運車站
                    </Typography>
                    <Typography
                        variant="subtitle1"
                        sx={{
                            color: "rgba(255, 255, 255, 0.85)",
                            mb: 4,
                        }}
                    >
                        使用 LookGo 讓您查完立即出發
                    </Typography>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            borderRadius: "28px",
                            px: 2,
                            py: 0.5,
                        }}
                    >
                        <InputBase
                            placeholder="您想找哪個臺北捷運車站?"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            sx={{
                                flex: 1,
                                fontSize: "0.95rem",
                                "& .MuiInputBase-input": {
                                    py: 1,
                                },
                            }}
                        />
                        <IconButton onClick={handleSearch} sx={{ color: "neutral.main" }}>
                            <SearchIcon />
                        </IconButton>
                    </Box>
                </Box>
            </Box>
            {/* Feature Sections */}
            {featureSections.map((section, index) => {
                const isOdd = index % 2 === 0;

                const imageBlock = (
                    <Box
                        sx={{
                            flex: 1,
                            minHeight: { xs: "240px", md: "320px" },
                        }}
                    >
                        <Box
                            component="img"
                            src={placeholderImg}
                            alt={section.title}
                            sx={{
                                width: "100%",
                                height: "100%",
                                minHeight: { xs: "240px", md: "320px" },
                                objectFit: "cover",
                                borderRadius: isOdd
                                    ? "16px 0 16px 0"
                                    : "0 16px 0 16px",
                            }}
                        />
                    </Box>
                );

                const textBlock = (
                    <Box
                        sx={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            px: { xs: 3, md: 6 },
                            py: { xs: 4, md: 0 },
                        }}
                    >
                        <Typography
                            variant="h5"
                            sx={{ mb: 1, color: "neutral.dark" }}
                        >
                            {section.title}
                        </Typography>
                        <Typography
                            variant="subtitle2"
                            sx={{ mb: 2, color: "secondary.dark" }}
                        >
                            {section.subtitle}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ mb: 3, color: "text.secondary", lineHeight: 1.8 }}
                        >
                            {section.description}
                        </Typography>
                        <Box>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => navigate(section.path)}
                                sx={{
                                    borderRadius: "6px",
                                    px: 3,
                                    py: 1,
                                }}
                            >
                                立即前往
                            </Button>
                        </Box>
                    </Box>
                );

                return (
                    <Box
                        key={section.title}
                        sx={{
                            maxWidth: '1280px',
                            display: "flex",
                            flexDirection: {
                                xs: "column",
                                md: isOdd ? "row" : "row-reverse",
                            },
                            alignItems: "stretch",
                            // backgroundColor: index % 2 === 0
                            //     ? "quaternary.main"
                            //     : "background.default",
                            margin: "0 auto",
                            py: { xs: 4, md: 6 },
                            px: { xs: 2, md: 8 },
                        }}
                    >
                        {imageBlock}
                        {textBlock}
                    </Box>
                );
            })}
        </Box>
    );
};

export default HomePage;
