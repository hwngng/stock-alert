'use strict';

// npm package
var ejs = require('ejs');

module.exports = {
  port: 9876,
  engine: ejs,
  templates: __dirname + '/../templates',
  source: {
    type: 'file',
    uri: './resources/raw_data.txt'
    // type: 'ws',
    // uri: 'wss://price-api.vndirect.com.vn/realtime'
  },
  allowedRooms: ['AAA', 'AAM', 'AAT', 'ABR', 'ABS', 'ABT', 'ACB', 'ACC', 'ACL', 'ADG', 'ADS', 'AGG', 'AGM', 'AGR', 'AMD', 'ANV', 'APC', 'APG', 'APH', 'ASG', 'ASM', 'ASP', 'AST', 'BAF', 'BBC', 'BCE', 'BCG', 'BCM', 'BFC', 'BHN', 'BIC', 'BID', 'BKG', 'BMC', 'BMI', 'BMP', 'BRC', 'BSI', 'BTP', 'BTT', 'BVH', 'BWE', 'C32', 'C47', 'CAV', 'CCI', 'CCL', 'CDC', 'CEE', 'CHP', 'CIG', 'CII', 'CKG', 'CLC', 'CLL', 'CLW', 'CMG', 'CMV', 'CMX', 'CNG', 'COM', 'CRC', 'CRE', 'CSM', 'CSV', 'CTD', 'CTF', 'CTG', 'CTI', 'CTR', 'CTS', 'CVT', 'D2D', 'DAG', 'DAH', 'DAT', 'DBC', 'DBD', 'DBT', 'DC4', 'DCL', 'DCM', 'DGC', 'DGW', 'DHA', 'DHC', 'DHG', 'DHM', 'DIG', 'DLG', 'DMC', 'DPG', 'DPM', 'DPR', 'DQC', 'DRC', 'DRH', 'DRL', 'DSN', 'DTA', 'DTL', 'DTT', 'DVP', 'DXG', 'DXS', 'DXV', 'E1VFVN30', 'EIB', 'ELC', 'EMC', 'EVE', 'EVF', 'EVG', 'FCM', 'FCN', 'FDC', 'FIR', 'FIT', 'FLC', 'FMC', 'FPT', 'FRT', 'FTS', 'FUEIP100', 'FUEKIV30', 'FUEMAV30', 'FUESSV30', 'FUESSV50', 'FUESSVFL', 'FUEVFVND', 'FUEVN100', 'GAB', 'GAS', 'GDT', 'GEG', 'GEX', 'GIL', 'GMC', 'GMD', 'GMH', 'GSP', 'GTA', 'GVR', 'HAG', 'HAH', 'HAI', 'HAP', 'HAR', 'HAS', 'HAX', 'HBC', 'HCD', 'HCM', 'HDB', 'HDC', 'HDG', 'HHP', 'HHS', 'HHV', 'HID', 'HII', 'HMC', 'HNG', 'HOT', 'HPG', 'HPX', 'HQC', 'HRC', 'HSG', 'HSL', 'HT1', 'HTI', 'HTL', 'HTN', 'HTV', 'HU1', 'HU3', 'HUB', 'HVH', 'HVN', 'HVX', 'IBC', 'ICT', 'IDI', 'IJC', 'ILB', 'IMP', 'ITA', 'ITC', 'ITD', 'JVC', 'KBC', 'KDC', 'KDH', 'KHG', 'KHP', 'KMR', 'KOS', 'KPF', 'KSB', 'L10', 'LAF', 'LBM', 'LCG', 'LCM', 'LDG', 'LEC', 'LGC', 'LGL', 'LHG', 'LIX', 'LM8', 'LPB', 'LSS', 'MBB', 'MCG', 'MCP', 'MDG', 'MHC', 'MIG', 'MSB', 'MSH', 'MSN', 'MWG', 'NAF', 'NAV', 'NBB', 'NCT', 'NHA', 'NHH', 'NHT', 'NKG', 'NLG', 'NNC', 'NSC', 'NT2', 'NTL', 'NVL', 'NVT', 'OCB', 'OGC', 'OPC', 'ORS', 'PAC', 'PAN', 'PC1', 'PDN', 'PDR', 'PET', 'PGC', 'PGD', 'PGI', 'PGV', 'PHC', 'PHR', 'PIT', 'PJT', 'PLP', 'PLX', 'PMG', 'PNC', 'PNJ', 'POM', 'POW', 'PPC', 'PSH', 'PTB', 'PTC', 'PTL', 'PVD', 'PVT', 'QBS', 'QCG', 'RAL', 'RDP', 'REE', 'ROS', 'S4A', 'SAB', 'SAM', 'SAV', 'SBA', 'SBT', 'SBV', 'SC5', 'SCD', 'SCR', 'SCS', 'SFC', 'SFG', 'SFI', 'SGN', 'SGR', 'SGT', 'SHA', 'SHB', 'SHI', 'SHP', 'SII', 'SJD', 'SJF', 'SJS', 'SKG', 'SMA', 'SMB', 'SMC', 'SPM', 'SRC', 'SRF', 'SSB', 'SSC', 'SSI', 'ST8', 'STB', 'STG', 'STK', 'SVC', 'SVD', 'SVI', 'SVT', 'SZC', 'SZL', 'TBC', 'TCB', 'TCD', 'TCH', 'TCL', 'TCM', 'TCO', 'TCR', 'TCT', 'TDC', 'TDG', 'TDH', 'TDM', 'TDP', 'TDW', 'TEG', 'TGG', 'THG', 'THI', 'TIP', 'TIX', 'TLD', 'TLG', 'TLH', 'TMP', 'TMS', 'TMT', 'TN1', 'TNA', 'TNC', 'TNH', 'TNI', 'TNT', 'TPB', 'TPC', 'TRA', 'TRC', 'TSC', 'TTA', 'TTB', 'TTE', 'TTF', 'TV2', 'TVB', 'TVS', 'TVT', 'TYA', 'UDC', 'UIC', 'VAF', 'VCA', 'VCB', 'VCF', 'VCG', 'VCI', 'VDP', 'VDS', 'VFG', 'VGC', 'VHC', 'VHM', 'VIB', 'VIC', 'VID', 'VIP', 'VIX', 'VJC', 'VMD', 'VND', 'VNE', 'VNG', 'VNL', 'VNM', 'VNS', 'VOS', 'VPB', 'VPD', 'VPG', 'VPH', 'VPI', 'VPS', 'VRC', 'VRE', 'VSC', 'VSH', 'VSI', 'VTB', 'VTO', 'YBM', 'YEG'],
  infoVersion: '1654185264',
  allowedHosts: ["http://localhost:3000", "http://localhost:9876", "https://localhost:5001"],
  adminAuthApi: 'http://localhost:65049/api/auth/isAdmin'
};
