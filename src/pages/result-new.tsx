import React, { FC } from "react";
import { Box, Button, Header, Page, Text } from "zmp-ui";
import { useNavigate } from "react-router";

const ResultPage: FC = () => {
  const navigate = useNavigate();

  return (
    <Page className="flex flex-col">
      <Header title="Operation Result" />
      <Box className="flex-1 flex flex-col items-center justify-center p-4">
        <Box className="text-center">
          <Text.Title className="mb-4">Operation Complete</Text.Title>
          <Text className="text-gray-600 mb-8">
            Your operation has been completed successfully
          </Text>
          <Button
            fullWidth
            onClick={() => navigate("/")}
            className="mt-4"
          >
            Back to Home
          </Button>
        </Box>
      </Box>
    </Page>
  );
};

export default ResultPage;
