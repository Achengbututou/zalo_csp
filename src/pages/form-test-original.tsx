import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Box, Input, Button, Text, Radio, Checkbox, Switch, DatePicker, Page } from "zmp-ui";
import { useNavigate } from "react-router";
import { SafeHeader } from "components/with-safe-area";

// 1. 这里直接定义 rawData 为 js 对象（将 json 粘贴到这里）
const rawData = {
    "wfData": [
        "{\"wfData\":[{\"id\":\"c9580706-1ed6-400f-8250-a1ba0104e2e4\",\"type\":\"scriptTask\",\"executeType\":\"1\",\"sqlDb\":\"lrsystemdb\",\"sqlStr\":\"update a set Approve_Status=N'12' \\nfrom FHIS_Leave_Header a \\nwhere RID=@processId\",\"sqlStrRevoke\":\"update a set Approve_Status=N'01' \\nfrom FHIS_Leave_Header a \\nwhere RID=@processId\",\"apiUrl\":\"\",\"apiUrlRevoke\":\"\",\"ioc\":\"\",\"iocRevoke\":\"\",\"isInit\":true,\"name\":\"submit\",\"x\":113,\"y\":360},{\"id\":\"58b1d70c-fe96-48d4-8057-5f52885a454a\",\"type\":\"scriptTask\",\"executeType\":\"1\",\"sqlDb\":\"lrsystemdb\",\"sqlStr\":\"update a \\nset Approve_Status=case when M_is_E = 1 and is_All_Voucher = 0 then 23\\n\\t\\t\\t\\t\\t    when Leave_Day > 15 and M_is_E = 0 then 22\\n\\t\\t\\t\\t\\t\\twhen ((Leave_Day <= 15 and is_All_Voucher = 1) or (Leave_Day > 15 and M_is_E = 1 and is_All_Voucher = 1)) and need_HRD = 0 then 99 \\n\\t\\t\\t\\t\\t\\twhen ((Leave_Day <= 15 and is_All_Voucher = 1) or (Leave_Day > 15 and M_is_E = 1 and is_All_Voucher = 1)) and need_HRD = 1 then 24 end\\n    , m_Approve_Date = getdate()\\nfrom FHIS_Leave_Header a \\nwhere RID=@processId\",\"sqlStrRevoke\":\"update a \\nset Approve_Status=case when Approve_Status=N'12'  then Approve_Status else N'10'  end\\nfrom FHIS_Leave_Header a \\nwhere RID=@processId\",\"apiUrl\":\"\",\"apiUrlRevoke\":\"\",\"ioc\":\"\",\"iocRevoke\":\"\",\"isInit\":true,\"x\":638,\"y\":370,\"name\":\"M Approve\"},{\"id\":\"f9a00383-5ea7-45a7-8147-8a274073a93b\",\"type\":\"startEvent\",\"authFields\":[{\"prop\":\"Entity_Add\",\"field\":\"\",\"label\":\"请假申请\",\"required\":false,\"isEdit\":true,\"isLook\":true},{\"prop\":\"fhisLeaveHeaderEntity_rid\",\"field\":\"RID\",\"label\":\"RID\",\"required\":true,\"isEdit\":true,\"isLook\":true},{\"prop\":\"fhisLeaveHeaderEntity_submit_UserID\",\"field\":\"Submit_UserID\",\"label\":\"填单人\",\"required\":true,\"isEdit\":true,\"isLook\":true},{\"prop\":\"fhisLeaveHeaderEntity_leave_Submit_Date\",\"field\":\"Leave_Submit_Date\",\"label\":\"提交日期\",\"required\":true,\"isEdit\":true,\"isLook\":true},{\"prop\":\"fhisLeaveHeaderEntity_leave_Type\",\"field\":\"Leave_Type\",\"label\":\"请假类型\",\"required\":true,\"isEdit\":true,\"isLook\":true},{\"prop\":\"fhisLeaveHeaderEntity_leave_Way\",\"label\":\"请假方式\",\"required\":true,\"isEdit\":true,\"isLook\":true},{\"prop\":\"fhisLeaveHeaderEntity_from_Date\",\"field\":\"From_Date\",\"label\":\"请假日期\",\"required\":true,\"isEdit\":true,\"isLook\":true},{\"prop\":\"fhisLeaveHeaderEntity_to_Date\",\"field\":\"To_Date\",\"label\":\"结束日期\",\"required\":true,\"isEdit\":true,\"isLook\":true},{\"prop\":\"fhisLeaveHeaderEntity_leave_Shift_Item\",\"field\":\"Leave_Shift_Item\",\"label\":\"请假时段\",\"required\":true,\"isEdit\":true,\"isLook\":true},{\"prop\":\"fhisLeaveHeaderEntity_from_Time\",\"field\":\"From_Time\",\"label\":\"请假时间\",\"required\":true,\"isEdit\":true,\"isLook\":true},{\"prop\":\"fhisLeaveHeaderEntity_to_Time\",\"field\":\"To_Time\",\"label\":\"结束时间\",\"required\":true,\"isEdit\":true,\"isLook\":true},{\"prop\":\"fhisLeaveHeaderEntity_remark\",\"field\":\"Remark\",\"label\":\"备注\",\"required\":false,\"isEdit\":true,\"isLook\":true},{\"prop\":\"fhisLeaveHeaderEntity_signature\",\"field\":\"signature\",\"label\":\"电子签名\",\"required\":true,\"isEdit\":true,\"isLook\":true}]},{\"id\":\"39fc565b-2b17-48a0-80da-f274541b05aa\",\"type\":\"userTask\",\"name\":\"请假申请-M级批核\",\"btnlist\":[{\"code\":\"agree\",\"name\":\"同意\",\"hidden\":false},{\"code\":\"disagree\",\"name\":\"驳回\",\"hidden\":false}]}]}"
    ]
};

// 2. 字段类型推断
function guessType(field) {
    if (/date|Date/i.test(field.label) || /date|Date/i.test(field.field)) return "date";
    if (/time|Time/i.test(field.label) || /time|Time/i.test(field.field)) return "text";
    if (/remark|备注/i.test(field.label)) return "textarea";
    if (/file|附件|凭证/i.test(field.label)) return "upload";
    if (/type|方式|类型/i.test(field.label)) return "select";
    if (/status|状态/i.test(field.label)) return "select";
    if (/signature|签名/i.test(field.label)) return "signature";
    return "text";
}

// 3. 解析authFields为schema
const wfDataObj = JSON.parse(rawData.wfData[0]);
const wfDataArr = wfDataObj.wfData;

function parseAuthFields(authFields) {
    return authFields
        .filter(f => f.label)
        .map((f, idx) => ({
            name: f.field || `field_${idx}`,
            label: f.label,
            type: guessType(f),
            rules: f.required ? { required: "必填" } : {},
            readOnly: f.isEdit === false,
        }));
}

// 4. 解析btnlist为按钮
function parseButtons(btnlist) {
    return btnlist?.map(btn => ({ code: btn.code, name: btn.name })) || [];
}

// 5. 生成默认值
function getDefaultValueForField(field) {
    if (field.type === "checkbox") return [];
    if (field.type === "switch") return false;
    if (field.type === "upload") return [];
    if (field.type === "date") return new Date();
    // 为某些字段设置默认值
    if (field.name === "Submit_UserID") return "当前用户";
    if (field.name === "Leave_Submit_Date") return new Date().toISOString().split('T')[0];
    if (field.name === "Leave_Type") return "年假";
    if (field.name === "Leave_Shift_Item") return "全天";
    return "";
}

function getDefaultValues(fields) {
    const obj = {};
    fields.forEach(f => {
        obj[f.name] = getDefaultValueForField(f);
    });
    return obj;
}

// 6. 渲染字段
function renderField(field, control, errors) {
    return (
        <Box key={field.name} className="mb-4 p-3 border border-gray-200 rounded-lg">
            <Text className="mb-2 font-medium text-gray-800">
                {field.label}
                {field.rules?.required && <Text className="text-red-500 ml-1">*</Text>}
            </Text>
            <Controller
                control={control}
                name={field.name}
                rules={field.rules}
                render={({ field: controllerField }) => {
                    switch (field.type) {
                        case "text":
                            return (
                                <Input 
                                    {...controllerField} 
                                    disabled={field.readOnly}
                                    placeholder={`请输入${field.label}`}
                                    className="w-full"
                                />
                            );
                        case "textarea":
                            return (
                                <Input.TextArea 
                                    {...controllerField} 
                                    disabled={field.readOnly}
                                    placeholder={`请输入${field.label}`}
                                    className="w-full"
                                    rows={3}
                                />
                            );
                        case "date":
                            return (
                                <DatePicker 
                                    value={controllerField.value} 
                                    onChange={controllerField.onChange} 
                                    disabled={field.readOnly}
                                    className="w-full"
                                />
                            );
                        case "select":
                            const getSelectOptions = (fieldName) => {
                                switch (fieldName) {
                                    case "Leave_Type":
                                        return ["年假", "病假", "事假", "调休", "产假", "陪产假"];
                                    case "leave_Way":
                                        return ["请假", "调班", "加班调休"];
                                    case "Leave_Shift_Item":
                                        return ["全天", "上午", "下午", "小时"];
                                    default:
                                        return ["选项1", "选项2", "选项3"];
                                }
                            };
                            
                            return (
                                <select 
                                    {...controllerField} 
                                    className="w-full p-2 border border-gray-300 rounded"
                                    disabled={field.readOnly}
                                >
                                    <option value="">请选择{field.label}</option>
                                    {getSelectOptions(field.name).map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            );
                        case "upload":
                            return (
                                <Box className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                    <input 
                                        type="file" 
                                        onChange={e => controllerField.onChange(e.target.files)} 
                                        multiple 
                                        disabled={field.readOnly}
                                        className="hidden"
                                        id={`upload-${field.name}`}
                                    />
                                    <label htmlFor={`upload-${field.name}`} className="cursor-pointer">
                                        <Text className="text-gray-600">点击上传{field.label}</Text>
                                    </label>
                                </Box>
                            );
                        case "signature":
                            return (
                                <Box className="border border-gray-300 rounded-lg p-4 h-32 bg-gray-50 flex items-center justify-center">
                                    <Text className="text-gray-500">电子签名区域</Text>
                                </Box>
                            );
                        default:
                            return (
                                <Input 
                                    {...controllerField} 
                                    disabled={field.readOnly}
                                    placeholder={`请输入${field.label}`}
                                    className="w-full"
                                />
                            );
                    }
                }}
            />
            {errors && errors[field.name]?.message && (
                <Text className="text-red-500 text-sm mt-1">{errors[field.name].message}</Text>
            )}
        </Box>
    );
}

// 7. 主组件
function parseAllAuthFields(wfData: any[]): any[] {
    const allFields: any[] = [];
    wfData.forEach((node: any) => {
        if (typeof node === 'object' && node && Array.isArray(node.authFields)) {
            node.authFields.forEach((f: any) => {
                if (f.label) allFields.push(f);
            });
        }
    });
    // 去重
    const seen = new Set();
    return allFields.filter(f => {
        const key = f.field || f.label;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

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

const authFields = parseAuthFields(parseAllAuthFields(wfDataArr));
const btnlist = parseAllButtons(wfDataArr);
const defaultValues = getDefaultValues(authFields);

const FormTestOriginal = () => {
    const navigate = useNavigate();
    const { control, handleSubmit, formState: { errors }, reset, watch } = useForm({
        defaultValues,
    });

    const onSubmit = (data) => {
        console.log("提交数据：", data);
        alert("提交成功！\n数据：" + JSON.stringify(data, null, 2));
    };

    const onButtonClick = (buttonCode: string) => {
        handleSubmit((data) => {
            console.log(`点击按钮: ${buttonCode}`, data);
            alert(`执行操作: ${buttonCode}\n表单数据已保存`);
        })();
    };

    // 监听表单变化
    const watchedValues = watch();

    return (
        <Page>
            <SafeHeader
                title="原始流程表单测试"
                showBackIcon={true}
                onBackClick={() => navigate(-1)}
            >
            </SafeHeader>
            
            <Box className="flex-1 overflow-auto">
                {/* 表单标题 */}
                <Box className="bg-white mx-4 my-3 p-4 rounded-lg shadow-sm">
                    <Text.Title size="small" className="text-gray-800 mb-2">
                        📋 动态流程表单测试（基于后台JSON）
                    </Text.Title>
                    <Text size="xSmall" className="text-gray-500">
                        基于Vue2项目API数据解析的动态表单渲染
                    </Text>
                </Box>

                {/* 表单字段 */}
                <Box className="bg-white mx-4 mb-3 p-4 rounded-lg shadow-sm">
                    <Text.Title size="small" className="mb-4 text-gray-800">表单字段</Text.Title>
                    
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {authFields.map(field => renderField(field, control, errors))}
                    </form>
                </Box>

                {/* 操作按钮 */}
                <Box className="bg-white mx-4 mb-3 p-4 rounded-lg shadow-sm">
                    <Text.Title size="small" className="mb-4 text-gray-800">操作按钮</Text.Title>
                    
                    <Box className="flex flex-wrap gap-3 mb-4">
                        {parseButtons(btnlist).map(btn => (
                            <Button 
                                key={btn.code} 
                                type={btn.code === 'agree' ? 'highlight' : 'danger'}
                                onClick={() => onButtonClick(btn.code)}
                                className="flex-1"
                            >
                                {btn.name}
                            </Button>
                        ))}
                    </Box>
                    
                    <Box className="flex gap-3">
                        <Button 
                            type="neutral" 
                            onClick={() => reset()}
                            className="flex-1"
                        >
                            重置表单
                        </Button>
                        <Button 
                            type="highlight" 
                            onClick={handleSubmit(onSubmit)}
                            className="flex-1"
                        >
                            提交表单
                        </Button>
                    </Box>
                </Box>

                {/* 实时数据预览 */}
                <Box className="bg-white mx-4 mb-4 p-4 rounded-lg shadow-sm">
                    <Text.Title size="small" className="mb-4 text-gray-800">实时数据预览</Text.Title>
                    
                    <Box className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                        <pre>{JSON.stringify(watchedValues, null, 2)}</pre>
                    </Box>
                </Box>
            </Box>
        </Page>
    );
};

export default FormTestOriginal;
