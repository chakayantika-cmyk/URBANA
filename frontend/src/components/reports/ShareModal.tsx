import React, { useState } from 'react';
import { X, Copy, Check, Share2, Globe } from 'lucide-react';
import { FacilityConnectivityResult, LocationState } from '../../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationState | null;
  connectivity: FacilityConnectivityResult | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  location,
  connectivity
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const token = connectivity?.shareable_link_token || 'demo-token-123';
  const shareUrl = `${window.location.origin}/?token=${token}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E5E5E2] shadow-2xl w-full max-w-md p-6 font-sans">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E2]">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#8B0000]" />
            <h3 className="text-[14px] font-bold uppercase tracking-wider text-[#111111]">
              Share Connectivity Report
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-[#6F6F6F] hover:text-[#111111]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-3">
          <p className="text-[12px] text-[#6F6F6F] leading-relaxed">
            Anyone with this link can view the read-only spatial accessibility, hospital/school travel times, and ecological assessment for <span className="font-semibold text-[#111111]">{location?.address || 'this location'}</span>.
          </p>

          <div className="p-3 bg-[#FAF9F7] border border-[#E5E5E2] flex items-center justify-between gap-2">
            <span className="text-[11px] font-mono text-[#111111] truncate">
              {shareUrl}
            </span>
            <button
              onClick={handleCopy}
              className="px-3 py-1 bg-[#111111] text-white hover:bg-black text-[11px] font-medium flex items-center gap-1 shrink-0 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-[#315C45]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="text-[10px] text-[#8E8E88] font-mono">
            Token: <span className="text-[#111111] font-semibold">{token}</span> · No authentication required for public view.
          </div>
        </div>

        <div className="pt-3 border-t border-[#E5E5E2] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 border border-[#E5E5E2] hover:border-[#111111] text-[12px] font-medium text-[#111111]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
