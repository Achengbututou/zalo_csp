import React, { useState, useMemo } from "react";
import { Box, Page, Header, Text, Button, useSnackbar, Tabs } from "zmp-ui";
import { useNavigate } from "react-router";
import { 
  RichTextEditor, 
  AdvancedTimePicker, 
  IconPicker, 
  ColorPicker, 
  AdvancedNumberInput,
  FileUploadComponent,
  AddressPicker,
  RatingComponent
} from "../components/rich-form-components";

// 原始工作流数据 - 来自Vue2项目的API数据
const rawData = {
  "wfData": [
    "{\"wfData\":[{\"id\":\"f9a00383-5ea7-45a7-8147-8a274073a93b\",\"type\":\"startEvent\",\"authFields\":[{\"prop\":\"Entity_Add\",\"field\":\"\",\"label\":\"请假申请\",\"required\":false,\"isEdit\":true,\"isLook\":true},{\"prop\":\"fhisLeaveHeaderEntity_rid\",\"field\":\"RID\",\"label\":\"RID\",\"required\":true,\"isEdit\":true,\"isLook\":true},{\"prop\":\"fhisLeaveHeaderEntity_submit_UserID\",\"field\":\"Submit_UserID\",\"label\":\"填单人\",\"required\":true,\"isEdit\":true,\"isLook\":true},{\"prop\":\"fhisLeaveHeaderEntity_leave_Submit_Date\",\"field\":\"Leave_Submit_Date\",\"label\":\"提交日期\",\"required\":true,\"isEdit\":true,\"isLook\":true},{\"prop\":\"fhisLeaveHeaderEntity_leave_Type\",\"field\":\"Leave_Type\",\"label\":\"请假类型\",\"required\":true,\"isEdit\":true,\"isLook\":true},{\"prop\":\"fhisLeaveHeaderEntity_leave_Way\",\"label\":\"请假方式\",\"required\":true,\"isEdit\":true,\"isLook\":true},{\"prop\":\"fhisLeaveHeaderEntity_from_Date\",\"field\":\"From_Date\",\"label\":\"请假日期\",\"required\":true,\"isEdit\":true,\"isLook\":true},{\"prop\":\"fhisLeaveHeaderEntity_remark\",\"field\":\"Remark\",\"label\":\"备注\",\"required\":false,\"isEdit\":false,\"isLook\":false}]},{\"id\":\"39fc565b-2b17-48a0-80da-f274541b05aa\",\"type\":\"userTask\",\"name\":\"请假申请-M级批核\",\"btnlist\":[{\"code\":\"agree\",\"name\":\"同意\",\"hidden\":false},{\"code\":\"disagree\",\"name\":\"驳回\",\"hidden\":false}]}]}"
  ]
};

// 辅助函数：解析所有字段
function parseAllAuthFields(wfData: any[]): any[] {
  const allFields: any[] = [];
  wfData.forEach((node: any) => {
    if (typeof node === 'object' && node && Array.isArray(node.authFields)) {
      node.authFields.forEach((f: any) => {
        if (f.label && f.label.trim()) allFields.push(f);
      });
    }
  });
  
  // 去重并过滤
  const seen = new Set();
  return allFields.filter(f => {
    const key = f.field || f.label;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// 辅助函数：解析所有按钮
function parseAllButtons(wfData: any[]): any[] {
  const allBtns: any[] = [];
  wfData.forEach((node: any) => {
    if (typeof node === 'object' && node && Array.isArray(node.btnlist)) {
      node.btnlist.forEach((btn: any) => {
        if (btn.code && btn.name) allBtns.push(btn);
      });
    }
  });
  
  // 去重
  const seen = new Set();
  return allBtns.filter(btn => {
    if (seen.has(btn.code)) return false;
    seen.add(btn.code);
    return true;
  });
}

// 主组件
const FormTestFixedPage: React.FC = () => {
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const [showJsonDialog, setShowJsonDialog] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [currentTab, setCurrentTab] = useState("basic");
  
  // 高级组件状态
  const [richTextContent, setRichTextContent] = useState("");
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  const [selectedIcon, setSelectedIcon] = useState("zi-star");
  const [selectedColor, setSelectedColor] = useState("#3b82f6");
  const [numberValue, setNumberValue] = useState(50);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedAddress, setSelectedAddress] = useState({ province: '', city: '', district: '', detail: '' });
  const [rating, setRating] = useState(0);

  // 解析工作流数据
  const { workflowInfo, parsedFields, parsedButtons } = useMemo(() => {
    try {
      // 解析工作流数据
      const wfDataObj = JSON.parse(rawData.wfData[0]);
      const wfDataArr = wfDataObj.wfData;
      
      // 提取字段和按钮
      const allAuthFields = parseAllAuthFields(wfDataArr);
      const allButtons = parseAllButtons(wfDataArr);

      // 工作流统计信息
      const workflowStats = {
        totalNodes: wfDataArr.length,
        userTasks: wfDataArr.filter((n: any) => n.type === 'userTask').length,
        scriptTasks: wfDataArr.filter((n: any) => n.type === 'scriptTask').length,
        gateways: wfDataArr.filter((n: any) => n.type?.includes('gateway')).length,
        totalFields: allAuthFields.length,
        requiredFields: allAuthFields.filter((f: any) => f.required).length,
        totalButtons: allButtons.length
      };

      return { 
        workflowInfo: workflowStats, 
        parsedFields: allAuthFields,
        parsedButtons: allButtons 
      };
    } catch (error) {
      console.error('解析工作流数据失败:', error);
      return { 
        workflowInfo: {}, 
        parsedFields: [],
        parsedButtons: []
      };
    }
  }, []);

  // 处理表单提交
  const handleSubmit = (buttonCode: string) => {
    openSnackbar({
      text: `表单操作：${buttonCode}`,
      type: 'success',
      duration: 3000
    });

    console.log('=== 表单提交结果 ===');
    console.log('表单数据:', formData);
    console.log('操作按钮:', buttonCode);
    console.log('时间戳:', new Date().toISOString());
  };

  // 处理字段变化
  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  return (
    <Page className="bg-gray-50">
      <Header
        title="动态表单测试"
        showBackIcon={true}
        onBackClick={() => navigate(-1)}
      />

      <Box className="flex-1 overflow-auto">
        {/* 组件选择器 - 横向滑动 */}
        <Box className="bg-white mx-4 my-3 rounded-lg shadow-sm">
          <Box className="p-3 border-b border-gray-200">
            <Text.Title size="small" className="text-gray-800">🎯 组件展示中心</Text.Title>
            <Text size="xSmall" className="text-gray-500 mt-1">左右滑动选择不同组件</Text>
          </Box>
          
          {/* 横向滑动的组件卡片 */}
          <Box className="p-3">
            <Box className="flex space-x-3 overflow-x-auto pb-2 component-selector">
              {[
                { key: 'basic', label: '基础组件', icon: '📝', color: 'bg-blue-50 border-blue-200' },
                { key: 'rich', label: '富文本', icon: '✏️', color: 'bg-purple-50 border-purple-200' },
                { key: 'time', label: '时间选择', icon: '🕒', color: 'bg-green-50 border-green-200' },
                { key: 'icon', label: '图标选择', icon: '🎨', color: 'bg-pink-50 border-pink-200' },
                { key: 'color', label: '颜色选择', icon: '🌈', color: 'bg-yellow-50 border-yellow-200' },
                { key: 'number', label: '数字输入', icon: '🔢', color: 'bg-indigo-50 border-indigo-200' },
                { key: 'upload', label: '文件上传', icon: '📁', color: 'bg-orange-50 border-orange-200' },
                { key: 'address', label: '地址选择', icon: '📍', color: 'bg-teal-50 border-teal-200' },
                { key: 'rating', label: '评分组件', icon: '⭐', color: 'bg-red-50 border-red-200' },
                { key: 'data', label: '数据输出', icon: '📊', color: 'bg-gray-50 border-gray-200' }
              ].map((component) => (
                <Button
                  key={component.key}
                  type={currentTab === component.key ? "highlight" : "neutral"}
                  size="small"
                  onClick={() => setCurrentTab(component.key)}
                  className={`flex-shrink-0 min-w-20 h-16 flex flex-col items-center justify-center border-2 component-card ${
                    currentTab === component.key ? 'border-blue-400 bg-blue-50 active' : component.color
                  }`}
                >
                  <Text className="text-lg mb-1">{component.icon}</Text>
                  <Text size="xSmall" className="text-center leading-tight">{component.label}</Text>
                </Button>
              ))}
            </Box>
          </Box>
        </Box>

        {/* 组件展示区域 */}
        <Box className="bg-white mx-4 mb-3 rounded-lg shadow-sm overflow-hidden">
          {currentTab === 'basic' && (
            <Box className="p-4">
                {/* 工作流信息概览 */}
                <Box className="mb-6">
                  <Text.Title size="small" className="mb-3 text-gray-800">
                    📊 工作流数据概览
                  </Text.Title>
                  <Box className="grid grid-cols-2 gap-3 text-sm">
                    <Box className="bg-blue-50 p-3 rounded">
                      <Text className="text-blue-600 font-medium">节点总数</Text>
                      <Text className="text-blue-800 text-lg font-bold">{'totalNodes' in workflowInfo ? workflowInfo.totalNodes : 0}</Text>
                    </Box>
                    <Box className="bg-green-50 p-3 rounded">
                      <Text className="text-green-600 font-medium">用户任务</Text>
                      <Text className="text-green-800 text-lg font-bold">{'userTasks' in workflowInfo ? workflowInfo.userTasks : 0}</Text>
                    </Box>
                    <Box className="bg-purple-50 p-3 rounded">
                      <Text className="text-purple-600 font-medium">表单字段</Text>
                      <Text className="text-purple-800 text-lg font-bold">{'totalFields' in workflowInfo ? workflowInfo.totalFields : 0}</Text>
                    </Box>
                    <Box className="bg-orange-50 p-3 rounded">
                      <Text className="text-orange-600 font-medium">操作按钮</Text>
                      <Text className="text-orange-800 text-lg font-bold">{'totalButtons' in workflowInfo ? workflowInfo.totalButtons : 0}</Text>
                    </Box>
                  </Box>
                </Box>

                {/* 解析到的表单字段 */}
                <Box className="mb-6">
                  <Text.Title size="small" className="mb-4">📝 解析到的表单字段</Text.Title>
                  <Box className="space-y-3">
                    {parsedFields.map((field, index) => (
                      <Box key={index} className="border border-gray-200 p-3 rounded">
                        <Text className="font-medium text-gray-800">{field.label}</Text>
                        <Text className="text-xs text-gray-500 mt-1">
                          字段名: {field.field || '无'} | 必填: {field.required ? '是' : '否'}
                        </Text>
                        <Box className="mt-2">
                          <input
                            type="text"
                            placeholder={`请输入${field.label}`}
                            className="w-full p-2 border border-gray-300 rounded text-sm"
                            onChange={(e) => handleFieldChange(field.field || field.label, e.target.value)}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* 操作按钮 */}
                <Box className="mb-6">
                  <Text.Title size="small" className="mb-4">🔘 操作按钮</Text.Title>
                  <Box className="flex flex-wrap gap-3">
                    {parsedButtons.map((button, index) => (
                      <Button
                        key={index}
                        type={button.code === 'agree' ? 'highlight' : 'danger'}
                        onClick={() => handleSubmit(button.code)}
                        className="flex-1"
                      >
                        {button.name}
                      </Button>
                    ))}
                  </Box>
                </Box>
              </Box>
            )}

            {currentTab === 'rich' && (
              <Box className="p-4">
                <Text.Title size="small" className="mb-4">📝 富文本编辑器</Text.Title>
                <Text className="text-gray-600 mb-4 text-sm">
                  支持加粗、斜体、下划线、链接、代码、列表等格式化功能
                </Text>
                
                <RichTextEditor
                  value={richTextContent}
                  onChange={setRichTextContent}
                  placeholder="请输入富文本内容，支持Markdown语法..."
                />

                <Box className="mt-4 p-3 bg-blue-50 rounded">
                  <Text size="small" className="text-blue-800 font-medium">输出数据：</Text>
                  <Text size="xSmall" className="text-blue-600 mt-1 font-mono">
                    {richTextContent || '暂无内容'}
                  </Text>
                </Box>
              </Box>
            )}

            {currentTab === 'time' && (
              <Box className="p-4">
                <Text.Title size="small" className="mb-4">🕒 高级时间选择器</Text.Title>
                <Text className="text-gray-600 mb-4 text-sm">
                  支持日期时间选择、快速选择、星期显示等功能
                </Text>
                
                <AdvancedTimePicker
                  value={selectedDateTime}
                  onChange={setSelectedDateTime}
                  mode="datetime"
                  showWeek={true}
                />

                <Box className="mt-4 p-3 bg-green-50 rounded">
                  <Text size="small" className="text-green-800 font-medium">选择结果：</Text>
                  <Text size="xSmall" className="text-green-600 mt-1">
                    时间戳: {selectedDateTime.getTime()}
                  </Text>
                  <Text size="xSmall" className="text-green-600">
                    ISO格式: {selectedDateTime.toISOString()}
                  </Text>
                </Box>
              </Box>
            )}

            {currentTab === 'icon' && (
              <Box className="p-4">
                <Text.Title size="small" className="mb-4">🎨 图标选择器</Text.Title>
                <Text className="text-gray-600 mb-4 text-sm">
                  从ZMP-UI提供的图标库中选择图标
                </Text>
                
                <IconPicker
                  value={selectedIcon}
                  onChange={setSelectedIcon}
                />

                <Box className="mt-4 p-3 bg-purple-50 rounded">
                  <Text size="small" className="text-purple-800 font-medium">选择结果：</Text>
                  <Text size="xSmall" className="text-purple-600 mt-1">
                    图标代码: {selectedIcon}
                  </Text>
                </Box>
              </Box>
            )}

            {currentTab === 'color' && (
              <Box className="p-4">
                <Text.Title size="small" className="mb-4">🌈 颜色选择器</Text.Title>
                <Text className="text-gray-600 mb-4 text-sm">
                  预设颜色、调色板、自定义颜色输入
                </Text>
                
                <ColorPicker
                  value={selectedColor}
                  onChange={setSelectedColor}
                />

                <Box className="mt-4 p-3 bg-yellow-50 rounded">
                  <Text size="small" className="text-yellow-800 font-medium">选择结果：</Text>
                  <Text size="xSmall" className="text-yellow-600 mt-1">
                    颜色值: {selectedColor}
                  </Text>
                  <Box 
                    className="w-full h-8 rounded mt-2 border"
                    style={{ backgroundColor: selectedColor }}
                  />
                </Box>
              </Box>
            )}

            {currentTab === 'number' && (
              <Box className="p-4">
                <Text.Title size="small" className="mb-4">🔢 高级数字输入</Text.Title>
                <Text className="text-gray-600 mb-4 text-sm">
                  步进器、滑动条、快速值选择
                </Text>
                
                <AdvancedNumberInput
                  value={numberValue}
                  onChange={setNumberValue}
                  min={0}
                  max={100}
                  step={1}
                  prefix="进度:"
                  suffix="%"
                  showSlider={true}
                />

                <Box className="mt-4 p-3 bg-indigo-50 rounded">
                  <Text size="small" className="text-indigo-800 font-medium">输入结果：</Text>
                  <Text size="xSmall" className="text-indigo-600 mt-1">
                    数值: {numberValue}
                  </Text>
                  <Text size="xSmall" className="text-indigo-600">
                    百分比: {numberValue}%
                  </Text>
                </Box>
              </Box>
            )}

            {currentTab === 'upload' && (
              <Box className="p-4">
                <Text.Title size="small" className="mb-4">📁 文件上传组件</Text.Title>
                <Text className="text-gray-600 mb-4 text-sm">
                  支持多文件上传、文件大小限制、格式限制
                </Text>
                
                <FileUploadComponent
                  value={uploadedFiles}
                  onChange={setUploadedFiles}
                  accept="image/*,.pdf,.doc,.docx"
                  multiple={true}
                  maxSize={10}
                />

                <Box className="mt-4 p-3 bg-orange-50 rounded">
                  <Text size="small" className="text-orange-800 font-medium">上传结果：</Text>
                  <Text size="xSmall" className="text-orange-600 mt-1">
                    文件数量: {uploadedFiles.length}
                  </Text>
                  {uploadedFiles.length > 0 && (
                    <Text size="xSmall" className="text-orange-600">
                      总大小: {uploadedFiles.reduce((total, file) => total + file.size, 0) / 1024 / 1024} MB
                    </Text>
                  )}
                </Box>
              </Box>
            )}

            {currentTab === 'address' && (
              <Box className="p-4">
                <Text.Title size="small" className="mb-4">📍 地址选择器</Text.Title>
                <Text className="text-gray-600 mb-4 text-sm">
                  省市区三级联动选择，支持详细地址输入
                </Text>
                
                <AddressPicker
                  value={selectedAddress}
                  onChange={setSelectedAddress}
                />

                <Box className="mt-4 p-3 bg-green-50 rounded">
                  <Text size="small" className="text-green-800 font-medium">选择结果：</Text>
                  <Text size="xSmall" className="text-green-600 mt-1">
                    完整地址: {[selectedAddress.province, selectedAddress.city, selectedAddress.district, selectedAddress.detail].filter(Boolean).join(' ') || '未选择'}
                  </Text>
                  <Text size="xSmall" className="text-green-600">
                    JSON: {JSON.stringify(selectedAddress)}
                  </Text>
                </Box>
              </Box>
            )}

            {currentTab === 'rating' && (
              <Box className="p-4">
                <Text.Title size="small" className="mb-4">⭐ 评分组件</Text.Title>
                <Text className="text-gray-600 mb-4 text-sm">
                  星级评分，支持点击、悬停效果
                </Text>
                
                <RatingComponent
                  value={rating}
                  onChange={setRating}
                  max={5}
                  allowHalf={false}
                />

                <Box className="mt-4 p-3 bg-pink-50 rounded">
                  <Text size="small" className="text-pink-800 font-medium">评分结果：</Text>
                  <Text size="xSmall" className="text-pink-600 mt-1">
                    当前评分: {rating}/5
                  </Text>
                  <Text size="xSmall" className="text-pink-600">
                    评价等级: {rating === 0 ? '未评分' : rating <= 2 ? '不满意' : rating <= 3 ? '一般' : rating <= 4 ? '满意' : '非常满意'}
                  </Text>
                </Box>
              </Box>
            )}

            {currentTab === 'data' && (
              <Box className="p-4">
                <Text.Title size="small" className="mb-4">📊 完整数据输出</Text.Title>
                <Text className="text-gray-600 mb-4 text-sm">
                  所有组件的当前值和API格式
                </Text>

                <Box className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                  <pre>{JSON.stringify({
                    basicForm: formData,
                    richText: richTextContent,
                    dateTime: {
                      timestamp: selectedDateTime.getTime(),
                      iso: selectedDateTime.toISOString(),
                      formatted: selectedDateTime.toLocaleString('zh-CN')
                    },
                    icon: selectedIcon,
                    color: selectedColor,
                    number: numberValue,
                    files: uploadedFiles.map(file => ({
                      name: file.name,
                      size: file.size,
                      type: file.type,
                      lastModified: file.lastModified
                    })),
                    address: selectedAddress,
                    rating: rating,
                    metadata: {
                      timestamp: new Date().toISOString(),
                      version: "2.0.0",
                      totalComponents: 8
                    }
                  }, null, 2)}</pre>
                </Box>

                <Box className="mt-4">
                  <Button 
                    type="highlight"
                    onClick={() => {
                      const data = {
                        basicForm: formData,
                        richText: richTextContent,
                        dateTime: selectedDateTime,
                        icon: selectedIcon,
                        color: selectedColor,
                        number: numberValue,
                        files: uploadedFiles,
                        address: selectedAddress,
                        rating: rating
                      };
                      handleSubmit('export_data');
                      navigator.clipboard?.writeText(JSON.stringify(data, null, 2));
                      openSnackbar({ text: '完整数据已复制到剪贴板', type: 'success' });
                    }}
                    className="w-full"
                  >
                    导出并复制完整数据
                  </Button>
                </Box>
              </Box>
            )}
        </Box>


      </Box>

      {/* JSON数据查看对话框 */}
      {showJsonDialog && (
        <Box 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowJsonDialog(false)}
        >
          <Box 
            className="bg-white rounded-lg max-w-4xl max-h-3/4 overflow-auto p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Box className="flex justify-between items-center mb-4">
              <Text.Title size="small">原始工作流数据</Text.Title>
              <Button 
                size="small" 
                type="neutral"
                onClick={() => setShowJsonDialog(false)}
              >
                关闭
              </Button>
            </Box>
            <Box className="bg-gray-100 p-3 rounded text-xs overflow-auto">
              <pre>{JSON.stringify(rawData, null, 2)}</pre>
            </Box>
          </Box>
        </Box>
      )}
    </Page>
  );
};

export default FormTestFixedPage;
