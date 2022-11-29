// SPDX-License-Identifier: MIT
pragma solidity >=0.6.6;

import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router01.sol";
import "./security/ReentrancyGuard.sol";
import "./interfaces/IERC20.sol";
import "hardhat/console.sol";

contract UniswapRouterAgregator is ReentrancyGuard {
    struct QuoteData {
        uint256 amountOut;
        address router;
    }

    address[] public routers;

    constructor(address[] memory _routers) public {
        routers = _routers;
    }

    /**
        Gets router* and path* that give max output amount with input amount and tokens
        @param amountIn input amount
        @param tokenIn source token
        @param tokenOut destination token
        @notice return max output amount and router and path, that give this output amount

        router* - Uniswap-like Router
        path* - token list to swap
     */
    function quote(
        uint256 amountIn,
        address tokenIn,
        address tokenOut
    )
        external
        view
        returns (
            uint256 amountOut,
            address router,
            address[] memory path
        )
    {

        require(amountIn > 0, "!amount");
        require(tokenIn != address(0), "!tokenIn");
        require(tokenOut != address(0), "!tokenOut");

        address[] memory _path = new address[](2);
        _path[0] = tokenIn;
        _path[1] = tokenOut;
        QuoteData memory bestQuote;

        for (uint256 i = 0; i < routers.length; i++) {
            address _router = routers[i];
            IUniswapV2Router01 routerInstance = IUniswapV2Router01(_router);

            uint256[] memory _amountsOut = routerInstance.getAmountsOut(
                amountIn,
                _path
            );

            if (_amountsOut[1] > bestQuote.amountOut) {
                bestQuote = QuoteData(_amountsOut[1], _router);
            }
        }
        console.log("end");
        return (bestQuote.amountOut, bestQuote.router, _path);
    }

    /**
        Swaps tokens on router with path, should check slippage
        @param amountIn input amount
        @param amountOutMin minumum output amount
        @param router Uniswap-like router to swap tokens on
        @param path tokens list to swap
        @notice return actual output amount
     */
    function swap(
        uint256 amountIn,
        uint256 amountOutMin,
        address router,
        address[] calldata path
    ) external nonReentrant returns (uint256[] memory amountsOut) {
        require(amountIn > 0, "!amountIn");
        require(amountOutMin > 0, "!amountOutMin");
        require(router != address(0), "!router");

        address[] memory _path = new address[](2);
        _path[0] = path[0];
        _path[1] = path[1];

        IERC20(_path[0]).transferFrom(msg.sender, address(this), amountIn);

        IERC20(_path[0]).approve(router, amountIn);

        IUniswapV2Router01 routerInstance = IUniswapV2Router01(router);

        // 86400 - day in seconds
        uint256 _deadline = now + 86400;

        amountsOut = routerInstance.swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            _path,
            msg.sender,
            _deadline
        );
    }
}
