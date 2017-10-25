pragma solidity ^0.4.13;

import 'zeppelin-solidity/contracts/token/MintableToken.sol';

contract edtaToken is MintableToken {
  string public name = "EDTA TOKEN";
  string public symbol = "XEDTA";
  uint256 public decimals = 2;
}