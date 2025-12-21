import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ZoneAnalysis } from "@/types/api.types";
import { translateRiskLevel } from "@/utils/translations";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ZonesAccordionProps {
  zones: ZoneAnalysis[];
}

// Helper function to get color scheme by risk level
const getRiskColors = (riskLevel: string) => {
  switch (riskLevel) {
    case 'Low':
      return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700',
        icon: '#10b981',
        badge: 'bg-green-100',
        badgeBorder: 'border-green-300',
        badgeText: 'text-green-800',
      };
    case 'Medium':
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-700',
        icon: '#f59e0b',
        badge: 'bg-yellow-100',
        badgeBorder: 'border-yellow-300',
        badgeText: 'text-yellow-800',
      };
    case 'High':
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
        icon: '#ef4444',
        badge: 'bg-red-100',
        badgeBorder: 'border-red-300',
        badgeText: 'text-red-800',
      };
    default:
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-700',
        icon: '#6b7280',
        badge: 'bg-gray-100',
        badgeBorder: 'border-gray-300',
        badgeText: 'text-gray-800',
      };
  }
};

export default function ZonesAccordion({ zones }: ZonesAccordionProps) {
  const [expandedZones, setExpandedZones] = useState<string[]>([]);

  const toggleZone = (zoneName: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedZones((prev) =>
      prev.includes(zoneName)
        ? prev.filter((z) => z !== zoneName)
        : [...prev, zoneName]
    );
  };

  return (
    <View className="bg-white rounded-3xl border border-slate-200 p-5 mb-4">
      {/* Header */}
      <View className="flex-row items-center mb-4">
        <Ionicons name="map-outline" size={20} color="#0a7ea4" />
        <Text className="text-base font-semibold text-slate-900 ml-2">
          Chi tiết theo vùng
        </Text>
        <View className="ml-auto bg-primary/10 px-3 py-1 rounded-full border border-primary/15">
          <Text className="text-sm font-semibold text-slate-900">
            {zones.length} vùng
          </Text>
        </View>
      </View>

      {/* Zones List */}
      <View className="gap-3">
        {zones.map((zone, index) => {
          const isExpanded = expandedZones.includes(zone.zone);
          const colors = getRiskColors(zone.riskLevel);

          return (
            <TouchableOpacity
              key={index}
              onPress={() => toggleZone(zone.zone)}
              activeOpacity={0.7}
              className={`border ${colors.border} rounded-2xl overflow-hidden`}
            >
              {/* Zone Header */}
              <View className={`p-4 ${colors.bg}`}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 flex-row items-center">
                    <View className={`w-9 h-9 rounded-full ${colors.badge} ${colors.badgeBorder} border items-center justify-center mr-3`}>
                      <Ionicons
                        name="locate-outline"
                        size={18}
                        color={colors.icon}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-slate-900">
                        {zone.zone}
                      </Text>
                      <View className="mt-1">
                        <View className={`self-start px-3 py-1 rounded-full ${colors.badge} ${colors.badgeBorder} border`}>
                          <Text className={`text-xs font-bold ${colors.badgeText}`}>
                            {translateRiskLevel(zone.riskLevel)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#64748b"
                  />
                </View>

                {/* Condition Preview */}
                {!isExpanded && (
                  <Text
                    className="text-sm text-slate-600 mt-3"
                    numberOfLines={1}
                  >
                    {zone.condition}
                  </Text>
                )}
              </View>

              {/* Expanded Content */}
              {isExpanded && (
                <View className="bg-white p-4 border-t ${colors.border}">
                  {/* Condition */}
                  <View className="mb-3">
                    <Text className="text-xs font-semibold text-slate-500 mb-1">
                      TÌNH TRẠNG
                    </Text>
                    <Text className="text-sm text-slate-800 leading-6">
                      {zone.condition}
                    </Text>
                  </View>

                  {/* Visual Evidence */}
                  <View className="mb-3">
                    <Text className="text-xs font-semibold text-slate-500 mb-1">
                      DẤU HIỆU NHẬN BIẾT
                    </Text>
                    <Text className="text-sm text-slate-700 leading-6">
                      {typeof zone.visualEvidence === "string"
                        ? zone.visualEvidence
                        : zone.visualEvidence.visualClues}
                    </Text>
                    {typeof zone.visualEvidence === "object" &&
                      zone.visualEvidence.certainty !== undefined && (
                        <View className="flex-row items-center mt-2">
                          <View className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <View
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(100, Math.max(0, (zone.visualEvidence.certainty || 0) * 100))}%`,
                                backgroundColor: "#0a7ea4",
                              }}
                            />
                          </View>
                          <Text className="text-xs text-slate-600 ml-2">
                            {Math.round(
                              (zone.visualEvidence.certainty || 0) * 100
                            )}
                            % chắc chắn
                          </Text>
                        </View>
                      )}
                  </View>

                  {/* Explanation */}
                  <View className="bg-primary/5 p-4 border border-primary/15 rounded-2xl">
                    <View className="flex-row items-start">
                      <Ionicons name="bulb-outline" size={18} color="#0a7ea4" />
                      <View className="flex-1 ml-2">
                        <Text className="text-xs font-semibold text-slate-900 mb-1">
                          GIẢI THÍCH
                        </Text>
                        <Text className="text-sm text-slate-700 leading-6">
                          {zone.explanation}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
