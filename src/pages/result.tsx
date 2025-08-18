import React, { FC } from "react";
import { Box, Button, Page, Text } from "zmp-ui";
import { useNavigate } from "react-router";
import { SafeHeader } from "components/with-safe-area";

const ResultPage: FC = () => {
  const navigate = useNavigate();

  return (
    <Page className="flex flex-col">
      <SafeHeader title="操作结果" showBackIcon={true} onBackClick={() => navigate(-1)}>
      </SafeHeader>
      <Box className="flex-1 flex flex-col items-center justify-center p-4">
        <Box className="text-center">
          <Text.Title className="mb-4">操作完成</Text.Title>
          <Text className="text-gray-600 mb-8">
            您的操作已成功完成
          </Text>
          <Button
            fullWidth
            onClick={() => navigate("/")}
            className="mt-4"
          >
            返回首页
          </Button>
        </Box>
      </Box>
    </Page>
  );
};

export default ResultPage;
